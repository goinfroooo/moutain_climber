#pragma once

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

class GameState {
public:
    // Variables partagées
    double wind_speed = 0.0;           // en m/s
    double wind_direction_deg = 0.0;   // 0-360
    int rockfall_events_count = 0;
    double last_rockfall_ts = 0.0;
    
    Player* player;
    bool player_alive = true;
    
    // Limites du monde
    double world_min_x = 0.0;
    double world_max_x = 1200.0;
    double world_min_y = 0.0;
    double world_max_y = 1000.0;

    std::vector<std::vector<std::string>> mountain;
    
    // Protection des accès
    std::mutex lock;
    
    // Constructeur et destructeur
    GameState();
    ~GameState();
    
    // Méthodes utilitaires
    void print_state();
    std::vector<std::vector<std::string>> get_mountain ();
    void save_mountain_to_file(const std::string& filename);

    double get_world_min_x() { return world_min_x; }
    double get_world_max_x() { return world_max_x; }
    double get_world_min_y() { return world_min_y; }
    double get_world_max_y() { return world_max_y; }    

    private:
        void create_mountain();
};
