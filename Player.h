#pragma once

#include "GameState.h"
#include "IO_SFML.h"
#include "WindSystem.h"
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>
#include <random>
#include <iostream>
#include <algorithm>

class WindSystem;
class Input_SFML;

class Player {

    friend class GameState;

private:

    Input_SFML *input_keyboard;
    WindSystem *wind;

    std::atomic<bool>* stop_flag;
    double tick_hz;
    mutable std::mutex locker;


    double player_width = 2.0; //m
    double player_height = 8.0; //m
    //Nb : pas giga coherent comme taille de personne mais bon on affinera plus tard
    double player_mass = 70; //kg
    double wind_influence = 0.03; //coefficient d'influence du vent sur la vitesse du joueur

    double player_x = 0.0; //m      
    double player_y = 0.0; //mS
    double player_vx = 0.0; //m/s
    double player_vy = 0.0; //m/s

    bool player_alive = true;

    

    //void clamp_player_to_world();
    bool same_sign(double a, double b) ;
    void adjust_player_velocity(double input_vx, double input_vy);
    void update_position();
    
    
public:
    Player(Input_SFML *input_keyboard, WindSystem* wind, std::atomic<bool>* stop, double frequency = 5.0);
    double get_x() const { return player_x; }
    double get_y() const { return player_y; }
    std::vector<double> get_state() const ;
    std::vector<double> get_characteristics() const ; 

    void run ();
    void print_state();
};
