#include "Player.h"
#include <cmath>
#include <iomanip>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

Player::Player(GameState* state,Input_SFML *input_keyboard, std::atomic<bool>* stop, double frequency) 
: state(state),input_keyboard(input_keyboard), stop_flag(stop), tick_hz(frequency) {
    player_x = (state->get_world_min_x() + state->get_world_max_x()) * 0.5;
    player_y = 0.0;
    player_vx = 0.0;
    player_vy = 0.0;
}

void Player::clamp_player_to_world() {
    // Si on touche un bord, on rebondit légèrement
    if (player_x < state->world_min_x) {
        player_x = state->world_min_x;
        player_vx = std::abs(player_vx) * 0.5;
    } else if (player_x > state->world_max_x) {
        player_x = state->world_max_x;
        player_vx = -std::abs(player_vx) * 0.5;
    }
    
    if (player_y < state->world_min_y) {
        player_y = state->world_min_y;
        player_vy = std::abs(player_vy) * 0.5;
    } else if (player_y > state->world_max_y) {
        player_y = state->world_max_y;
        player_vy = -std::abs(player_vy) * 0.5;
    }
}

void Player::adjust_player_velocity(double input_vx, double input_vy) {

    if (same_sign(input_vx, player_vx)) {
        player_vx += input_vx;
    } else {
        player_vx = 0.0;
    }
    if (same_sign(input_vy, player_vy)) {
        player_vy += input_vy;
    } else {
        player_vy = 0.0;
    }
    // Influence du vent sur la vitesse horizontale
    double rad = (state->wind_direction_deg / 180.0) * M_PI;
    double wind_vx = state->wind_speed * cos(rad);
    double wind_vy = state->wind_speed * sin(rad);
    
    // Approche simple: vent pousse légèrement le joueur
    player_vx += wind_influence * wind_vx;
    player_vy += wind_influence * wind_vy;

    if (player_vx > 10.0) {
        player_vx = 10.0;
    }
    if (player_vx < -10.0) {
        player_vx = -10.0;
    }
    if (player_vy > 10.0) {
        player_vy = 10.0;
    }
    if (player_vy < -10.0) {
        player_vy = -10.0;
    }
    
}


void Player::update_position() {
    player_x += player_vx ;
    player_y += player_vy ;

    // Confinement aux bornes
    clamp_player_to_world();
}


bool Player::same_sign(double a, double b) {
    return (a == 0.0 || b == 0.0) || (a > 0.0 && b > 0.0) || (a < 0.0 && b < 0.0);
}

void Player::run() {
    const auto tick_duration = std::chrono::duration<double>(1.0 / tick_hz);
    while (!stop_flag->load()) {
        std::vector<std::string> pressedKeys = input_keyboard->getPressedKeys();
        double input_vx = 0.0;
        double input_vy = 0.0;
        for (const auto& key : pressedKeys) {
            if (key == "left") {
                input_vx = -1.0;
            }
            if (key == "right") {
                input_vx = 1.0;
            }
            if (key == "up") {
                input_vy = -1.0;
            }
            if (key == "down") {
                input_vy = 1.0;
            }
        }
        adjust_player_velocity(input_vx, input_vy);
        update_position();
        std::this_thread::sleep_for(tick_duration);
        }
}