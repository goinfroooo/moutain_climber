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
            // Direction varie plus vite et plus sur toute la plage
            // On augmente la variance typique de la variation de direction
            double direction_variation_factor = 12.0; // plus fort qu'avant (était 5.0)
            double direction_delta = direction_noise(rng) * direction_variation_factor;

            // Changement plus marqué, ainsi la direction couvre mieux tout le cercle
            wind_direction_deg = fmod(wind_direction_deg + direction_delta, 360.0);
            if (wind_direction_deg < 0) wind_direction_deg += 360.0;

            // Vitesse : variations plus larges
            double speed_delta = speed_noise(rng) * 2.2; // booste les variations par rapport à avant

            // Rafale plus fréquente et plus forte
            if (std::uniform_real_distribution<double>(0.0, 1.0)(rng) < 0.15) {
                double gust = std::normal_distribution<double>(90.0, 14.0)(rng);
                speed_delta += gust;
            }

            // Lissage plus faible (plus de "sauts" possibles)
            double inertia = 0.35; // moins lissé qu'avant (0.5)
            wind_speed = inertia * wind_speed + (1.0 - inertia) * (wind_speed + speed_delta);

            // Borne de sécurité
            wind_speed = std::clamp(wind_speed, 0.0, 22.0);
        }

        std::this_thread::sleep_for(tick_duration);
    }
}

void WindSystem::print_state() {
    std::lock_guard<std::mutex> guard(locker);
    std::cout << "vent : " << std::fixed << std::setprecision(1) 
              << wind_speed << " m/s a " << wind_direction_deg << "degres | "<<std::endl;
}