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
    
    std::atomic<bool>* stop_flag;
    double tick_hz;
    std::mt19937 rng;
    std::normal_distribution<double> direction_noise;
    std::normal_distribution<double> speed_noise;

    mutable std::mutex locker;

    double wind_speed = 0.0;           // en m/s
    double wind_direction_deg = 0.0;   // 0-360
    
public:
    WindSystem(std::atomic<bool>* stop, double frequency = 5.0);
    void run();
    void print_state();
    double get_speed() const ;
    double get_direction() const ;
};
