#include "WindSystem.h"
#include <cmath>
#include <iomanip>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

WindSystem::WindSystem(GameState* game_state, std::atomic<bool>* stop, double frequency) 
    : state(game_state), stop_flag(stop), tick_hz(frequency),
      rng(std::random_device{}()),
      direction_noise(0.0, 1.5),
      speed_noise(0.0, 4.0) {
}

void WindSystem::run() {
    const auto tick_duration = std::chrono::duration<double>(1.0 / tick_hz);
    
    while (!stop_flag->load()) {
        {
            std::lock_guard<std::mutex> guard(state->lock);
            // Dérive lente de la direction, variations modérées de la vitesse

            double stability = std::clamp(1.0 - state->wind_speed / 20.0, 0.1, 1.0);

            // bruit directionnel : écart-type dépendant de la stabilité
            double direction_delta = direction_noise(rng) * stability * 5.0; // 5° max typique

            // on met à jour la direction et la remet entre 0 et 360
            state->wind_direction_deg = fmod(state->wind_direction_deg + direction_delta, 360.0);
            if (state->wind_direction_deg < 0) state->wind_direction_deg += 360.0;

            double speed_delta = speed_noise(rng); // bruit normal standard

            // Probabilité faible (1%) d'une rafale
            if (std::uniform_real_distribution<double>(0.0, 1.0)(rng) < 0.1) {
                double gust = std::normal_distribution<double>(70.0, 8.0)(rng);
                speed_delta += gust;
                //std::cout << "speed_delta: " << speed_delta << std::endl;
            }

            // Lissage pour éviter les changements trop brutaux moyens
            double inertia = 0.5; // 0.9 = très lissé, 0.0 = brutal
            state->wind_speed = inertia * state->wind_speed + (1.0 - inertia) * (state->wind_speed + speed_delta);

            // On borne
            state->wind_speed = std::clamp(state->wind_speed, 0.0, 20.0);

        
        }
        
        std::this_thread::sleep_for(tick_duration);
    }
}
