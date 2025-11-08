#include "GameState.h"
#include "Player.h"
#include <cmath>
#include <iomanip>
#include <random>
#include <vector>
#include <iostream>
#include <fstream>
#include <mutex>
#include <stdexcept>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

GameState::GameState(Player* player, WindSystem* wind) {
    this->player = player;
    this->wind_system = wind;
    create_mountain();
    
}

GameState::~GameState() {
    if (player) {
        delete player;
    }
    if (wind_system) {
        delete wind_system;
    }
}

void GameState::print_state() {
    
    wind_system->print_state();
    player->print_state();

              /*<< "rochers: " << rockfall_events_count << " évts | "
              << "player: (" << std::setprecision(2) << player_x << ", " << player_y << ")"
              << std::endl;*/
}

void GameState::create_mountain() {

    if (DEBUG)
        std::cout<<"Generation de la forme de la montagne... ";
    // Initialiser la taille du vecteur moutain
    int width = static_cast<int>(world_max_x - world_min_x);
    int height = static_cast<int>(world_max_y - world_min_y);

    mountain.resize(height, std::vector<std::string>(width, " "));

    // Calculer le centre
    double center_x = (world_max_x + world_min_x) / 2.0;

    // Générateur de nombres aléatoires
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<double> dist(0.0, 1.0);

    int surface_y = height-1;
    int col = 0;

    try {
        // Pour chaque colonne, déterminer la position du caractère montagne
        while (col < width) {
            std::string edge;
            if ((surface_y <= 0 && col<center_x) || (surface_y >= height-1 && col > center_x)) {
                edge = "_";
            } 
            else edge =  dist(gen) < 0.4 ? "_" : "|";
            
            // Debug info avant écriture
            if (surface_y < 0 || surface_y >= height || col < 0 || col >= width) {
                std::cerr << "[ERREUR MONTAGNE] Accès hors limites: surface_y=" << surface_y << " col=" << col 
                          << " (height=" << height << ", width=" << width << ")" << std::endl;
                throw std::out_of_range("Accès hors limites à la matrice montagne");
            }
            mountain[surface_y][col] = edge;

            if (edge == "_") col += 1;
            //On creer la forme de montagne en triangle
            if (col < center_x)  {
                // On monte d'une case si | sinon on reste a la meme hauteur
                if (edge == "_") {
                    // rien à faire
                } else {
                    surface_y -= 1;
                }
            }
            else {
                // On descend d'une case si | sinon on reste a la meme hauteur
                if (edge == "_") {
                    // rien à faire
                } else {
                    surface_y += 1;
                }
            }
            col += 1; // PASSSSS SURRRRR A SUPPPPPPPPP
            // Affichage debug après modification
            if (DEBUG && (surface_y < 0 || surface_y >= height)) {
                std::cerr << "[DEBUG MONTAGNE] surface_y invalide après modification: " << surface_y << std::endl;
            }
        }
    } catch (const std::exception& ex) {
        std::cerr << "[Exception] lors de la génération de la montagne: " << ex.what() << std::endl;
    }
    if (DEBUG)
        std::cout<<"Done"<<std::endl;
}

std::vector<std::vector<std::string>> GameState::get_mountain () {
    return this->mountain;
}

void GameState::save_mountain_to_file(const std::string& filename) {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cout << "Erreur: Impossible d'ouvrir le fichier " << filename << std::endl;
        return;
    }
    
    file << "Matrice montagne (" << mountain.size() << "x" << (mountain.empty() ? 0 : mountain[0].size()) << "):" << std::endl;
    file << "Légende: '|' = sommet, '_' = base, ' ' = espace vide" << std::endl;
    file << std::string(60, '=') << std::endl;
    
    for (int row = 0; row < int(mountain.size()); row++) {
        for (int col = 0; col < int(mountain[row].size()); col++) {
            file << mountain[row][col];
        }
        file << std::endl;
    }

    
    file << std::string(60, '=') << std::endl;
    
    // Statistiques
    int summit_count = 0;
    int base_count = 0;
    int empty_count = 0;
    
    for (const auto& row : mountain) {
        for (const auto& cell : row) {
            if (cell == "|") summit_count++;
            else if (cell == "_") base_count++;
            else if (cell == " ") empty_count++;
        }
    }
    
    file << "Statistiques:" << std::endl;
    file << "- Sommets ('|'): " << summit_count << std::endl;
    file << "- Bases ('_'): " << base_count << std::endl;
    file << "- Espaces vides (' '): " << empty_count << std::endl;
    file << "- Total: " << (summit_count + base_count + empty_count) << std::endl;
    
    file.close();
    std::cout << "Matrice montagne sauvegardée dans " << filename << std::endl;
}