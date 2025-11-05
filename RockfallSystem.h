#pragma once

#include "GameState.h"
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>
#include <random>
#include <iostream>
#include <algorithm>

class RockfallSystem {
private:
    GameState* state;
    std::atomic<bool>* stop_flag;
    double base_rate_hz;
    std::mt19937 rng;
    std::uniform_real_distribution<double> uniform_dist;
    
public:
    RockfallSystem(GameState* game_state, std::atomic<bool>* stop, double rate = 0.5);
    void run();
};
