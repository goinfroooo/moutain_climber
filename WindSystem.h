#pragma once

#include "GameState.h"
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>
#include <random>
#include <iostream>
#include <algorithm>

class WindSystem {
private:
    GameState* state;
    std::atomic<bool>* stop_flag;
    double tick_hz;
    std::mt19937 rng;
    std::normal_distribution<double> direction_noise;
    std::normal_distribution<double> speed_noise;
    
public:
    WindSystem(GameState* game_state, std::atomic<bool>* stop, double frequency = 5.0);
    void run();
};
