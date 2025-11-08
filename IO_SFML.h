#pragma once

#include <SFML/Graphics.hpp>
#include <string>
#include <iostream>
#include <vector>
#include <algorithm>
#include <vector>
#include <atomic>

extern const bool DEBUG;
extern std::atomic<bool> g_stop_flag;

class Player;
class GameState;

class Output_SFML {
    private:
        double win_size_x = 1920; // px
        double win_size_y = 1080; // px
        sf::RenderWindow window;
        sf::Font font;
        sf::CircleShape shape;
        std::vector<std::vector<sf::RectangleShape>> mountainShapes;
        
        // Optimisation : VertexArray pour le rendu batché
        sf::VertexArray mountainVertices;
        bool worldInitialized = false;
        float cell_width = 0.0f;
        float cell_height = 0.0f;

    public:
        Output_SFML();
        ~Output_SFML();
        
        sf::RenderWindow& getWindow() { return window; }
        sf::CircleShape& getShape() { return shape; }
        sf::Font& getFont() { return font; }
        std::vector<std::vector<sf::RectangleShape>>& getMountainShapes() { return mountainShapes; }
        void render_world(const GameState* state);
        void update_world(GameState *state);
};

class Input_SFML {
    private:
        Output_SFML* output_sfml;
        std::vector<std::string> pressedKeys;
        std::string getKeyName(sf::Keyboard::Key key);
        
    public: 
        Input_SFML(Output_SFML* output);
        ~Input_SFML();
        int check_input();
        std::vector<std::string> getPressedKeys() { return pressedKeys; }
};