#include "RockfallSystem.h"
#include <cmath>
#include <iomanip>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

RockfallSystem::RockfallSystem(GameState* game_state, std::atomic<bool>* stop, double rate) 
    : state(game_state), stop_flag(stop), base_rate_hz(rate),
      rng(std::random_device{}()),
      uniform_dist(0.0, 1.0) {
}

void RockfallSystem::run() {
    const double dt = 0.1; // pas de temps pour le processus de Bernoulli
    
    while (!stop_flag->load()) {
        // Probabilité d'un événement pendant dt
        double p = std::max(0.0, std::min(0.9, base_rate_hz * dt));
        if (uniform_dist(rng) < p) {
            std::lock_guard<std::mutex> guard(state->lock);
            state->rockfall_events_count++;
            auto now = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::steady_clock::now().time_since_epoch()).count();
            state->last_rockfall_ts = now / 1000.0;
        }
        
        std::this_thread::sleep_for(std::chrono::duration<double>(dt));
    }
}
