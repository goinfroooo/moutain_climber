#include "WindSystem.h"
#include <cmath>
#include <iomanip>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

WindSystem::WindSystem(std::atomic<bool>* stop, double frequency) 
    : stop_flag(stop), tick_hz(frequency),
      rng(std::random_device{}()),
      direction_noise(0.0, 1.5),
      speed_noise(0.0, 4.0) {
}

double WindSystem::get_speed() const {
     std::lock_guard<std::mutex> lock(locker); 
     return wind_speed; 

}

double WindSystem::get_direction() const { 
    std::lock_guard<std::mutex> lock(locker); 
    return wind_direction_deg; 
}

void WindSystem::run() {
    const auto tick_duration = std::chrono::duration<double>(1.0 / tick_hz);
    
    while (!stop_flag->load()) {
        {
            std::lock_guard<std::mutex> guard(locker);
            // Dérive lente de la direction, variations modérées de la vitesse

            double stability = std::clamp(1.0 - wind_speed / 20.0, 0.1, 1.0);

            // bruit directionnel : écart-type dépendant de la stabilité
            double direction_delta = direction_noise(rng) * stability * 5.0; // 5° max typique

            // on met à jour la direction et la remet entre 0 et 360
            wind_direction_deg = fmod(wind_direction_deg + direction_delta, 360.0);
            if (wind_direction_deg < 0) wind_direction_deg += 360.0;

            double speed_delta = speed_noise(rng); // bruit normal standard

            // Probabilité faible (1%) d'une rafale
            if (std::uniform_real_distribution<double>(0.0, 1.0)(rng) < 0.1) {
                double gust = std::normal_distribution<double>(70.0, 8.0)(rng);
                speed_delta += gust;
                //std::cout << "speed_delta: " << speed_delta << std::endl;
            }

            // Lissage pour éviter les changements trop brutaux moyens
            double inertia = 0.5; // 0.9 = très lissé, 0.0 = brutal
            wind_speed = inertia * wind_speed + (1.0 - inertia) * (wind_speed + speed_delta);

            // On borne
            wind_speed = std::clamp(wind_speed, 0.0, 20.0);

        
        }
        
        std::this_thread::sleep_for(tick_duration);
    }
}

void WindSystem::print_state() {
    std::lock_guard<std::mutex> guard(locker);
    std::cout << "vent : " << std::fixed << std::setprecision(1) 
              << wind_speed << " m/s a " << wind_direction_deg << "degres | "<<std::endl;
}