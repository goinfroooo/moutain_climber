#include "GameState.h"
#include "WindSystem.h"
#include "RockfallSystem.h"
#include "Player.h"
#include "IO_SFML.h"
#include <signal.h>
#include <vector>
#include <locale>
#include <iostream>
#include <thread>
#include <atomic>

const bool DEBUG = true;
// Variable globale pour l'arrêt propre
std::atomic<bool> g_stop_flag(false);

// Gestionnaire de signal pour Ctrl+C
void signal_handler(int signal) {
    if (signal == SIGINT) {
        std::cout << "\nArret demande..." << std::endl;
        g_stop_flag.store(true);
    }
}

int main() {
    if (DEBUG)
        std::cout << "debut du programme" <<std::endl;
    std::setlocale(LC_ALL, "");
    // Configuration du gestionnaire de signal
    signal(SIGINT, signal_handler);

    // Création des systèmes
    
    GameState state;
    state.save_mountain_to_file("mountain_debug.txt");
    Output_SFML sfml_output (state.get_mountain());
    Input_SFML sfml_input (&sfml_output);
    WindSystem wind_system(&state, &g_stop_flag, 5.0);
    Player player(&state, &sfml_input, &g_stop_flag, 30.0);
    //RockfallSystem rockfall_system(&state, &g_stop_flag, 0.6);

    // Lancement des threads

    std::vector<std::thread> threads;
    threads.emplace_back(&WindSystem::run, &wind_system);
    threads.emplace_back(&Player::run, &player);
    //threads.emplace_back(&RockfallSystem::run, &rockfall_system);
    
    

    sfml_output.getWindow().setFramerateLimit(60);

    
    std::cout << "Jeu lance. Ctrl+C pour quitter." << std::endl;
    
    // Boucle principale d'affichage
    
    while (!g_stop_flag.load() && sfml_output.getWindow().isOpen()) {
        sfml_input.check_input();
        state.print_state();
        sfml_output.render_world(state.get_mountain(), player);
        

    }
    
    // Arrêt propre des threads
    g_stop_flag.store(true);
    
    for (auto& thread : threads) {
        if (thread.joinable()) {
            thread.join();
        }
    }
    std::cout<<"Threads stoppes"<<std::endl;

    sfml_output.~Output_SFML();
    
    std::cout << "Arret termine" << std::endl;
    return 0;
}
