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
#include <chrono>

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

    Output_SFML sfml_output;
    Input_SFML sfml_input (&sfml_output);

    // Création des systèmes
    WindSystem wind_system( &g_stop_flag, 5.0);
    Player player(&sfml_input, &wind_system, &g_stop_flag, 5.0);
    
    GameState state (&player, &wind_system);
    state.save_mountain_to_file("mountain_debug.txt");
    sfml_output.update_world(&state);

    
    //RockfallSystem rockfall_system(&state, &g_stop_flag, 0.6);

    // Lancement des threads

    std::vector<std::thread> threads;
    threads.emplace_back(&WindSystem::run, &wind_system);
    threads.emplace_back(&Player::run, &player);
    //threads.emplace_back(&RockfallSystem::run, &rockfall_system);

    
    std::cout << "Jeu lance. Ctrl+C pour quitter." << std::endl;
    
    // Boucle principale d'affichage
    
    try {
        while (!g_stop_flag.load() && sfml_output.getWindow().isOpen()) {
            auto t0 = std::chrono::high_resolution_clock::now();
            sfml_input.check_input();
            auto t1 = std::chrono::high_resolution_clock::now();
            state.print_state();
            auto t2 = std::chrono::high_resolution_clock::now();
            sfml_output.render_world(&state);
            auto t3 = std::chrono::high_resolution_clock::now();

            auto d_check_input = std::chrono::duration_cast<std::chrono::microseconds>(t1 - t0).count();
            auto d_print_state = std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1).count();
            auto d_render_world = std::chrono::duration_cast<std::chrono::microseconds>(t3 - t2).count();

            // Afficher seulement si render_world prend plus de 16ms (60 FPS) ou toutes les 60 frames
            static int frame_count = 0;
            frame_count++;
            if (d_render_world > 16000 || frame_count % 60 == 0) {
                std::cout << "[PERF] Frame " << frame_count 
                          << " - check_input: " << (d_check_input/1000.0) << " ms, "
                          << "print_state: " << (d_print_state/1000.0) << " ms, "
                          << "render_world: " << (d_render_world/1000.0) << " ms" << std::endl;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "[Exception dans la boucle principale] : " << e.what() << std::endl;
        g_stop_flag.store(true);
    } catch (...) {
        std::cerr << "[Erreur inconnue dans la boucle principale]" << std::endl;
        g_stop_flag.store(true);
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
