#pragma once

#include "WindSystem.h"
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>
#include <random>
#include <iostream>
#include <algorithm>
#include <vector>

extern const bool DEBUG;

// Forward declaration
class Player;
class WindSystem;

class GameState {
public:
    // Variables partagées
    
    int rockfall_events_count = 0;
    double last_rockfall_ts = 0.0;

    WindSystem *wind_system;
    Player* player;
    
    
    // Limites du monde
    double const world_min_x = 0.0;
    double const world_max_x = 1920.0;
    double const world_min_y = 0.0;
    double const world_max_y = 1080.0;

    std::vector<std::vector<std::string>> mountain;
    
    // Protection des accès
    mutable std::mutex locker;
    
    // Constructeur et destructeur
    GameState(Player* player, WindSystem* wind);
    ~GameState();
    
    // Méthodes utilitaires
    void print_state();
    std::vector<std::vector<std::string>> get_mountain ();
    void save_mountain_to_file(const std::string& filename);

    double get_world_min_x() const { return world_min_x; }
    double get_world_max_x() const { return world_max_x; }
    double get_world_min_y() const { return world_min_y; }
    double get_world_max_y() const { return world_max_y; }    
    std::vector<std::vector<std::string>> get_mountain () const {std::lock_guard<std::mutex> lock(locker); return mountain;}
    Player* get_player() const {return player;}
    

    private:
        void create_mountain();
};
