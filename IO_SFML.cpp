#include "IO_SFML.h"
#include "GameState.h"
#include "Player.h"
#include <iostream>
#include <string>
// #include <optional>  // Non nécessaire avec SFML 2.x

// Constructeur Output_SFML
Output_SFML::Output_SFML() :
    window(sf::VideoMode({static_cast<unsigned int>(win_size_x), static_cast<unsigned int>(win_size_y)}), "SFML Test - Touches Actives")
    //on initialise le texte avec une chaîne vide et la police
    {
        window.setFramerateLimit(60);  // Augmenté à 60 FPS grâce aux optimisations
    // Chargement de la police système Windows
    if (!font.openFromFile("C:/Windows/Fonts/arial.ttf")) {
        std::cout << "Erreur: Impossible de charger la police arial.ttf" << std::endl;
        // Utiliser une police par défaut si arial n'est pas disponible
    }
    
    // Initialiser les objets de texte après le chargement de la poli
    
    
}

Output_SFML::~Output_SFML() {
    window.close();
}


void Output_SFML::render_world(const GameState* state) {
    try {
        // Vérifier que le monde a été initialisé
        if (!worldInitialized) {
            std::cerr << "[ERREUR render_world] Le monde n'a pas été initialisé. Appeler update_world() d'abord." << std::endl;
            return;
        }

        // Ajout du joueur
        const Player *player = state->get_player();
        sf::CircleShape playerShape(10.0f);
        playerShape.setPosition(sf::Vector2f(static_cast<float>(player->get_x()), static_cast<float>(player->get_y())));
        playerShape.setFillColor(sf::Color::Red);

        // Rendu optimisé : utiliser VertexArray au lieu de dessiner chaque RectangleShape
        window.clear();
        
        // Dessiner la montagne avec VertexArray (beaucoup plus rapide)
        if (mountainVertices.getVertexCount() > 0) {
            window.draw(mountainVertices);
        }
        
        // Dessiner le joueur
        window.draw(playerShape);
        window.display();
        
    } catch (const std::exception& ex) {
        std::cerr << "[ERREUR render_world] Exception attrapée : " << ex.what() << std::endl;
        window.close();
    } catch (...) {
        std::cerr << "[ERREUR render_world] Exception inconnue attrapée !" << std::endl;
        window.close();
    }
}

void Output_SFML::update_world (GameState* state) {
    const std::vector<std::vector<std::string>> mountain = state->get_mountain();
    int height = static_cast<int>(mountain.size());
    int width = (height > 0 && !mountain[0].empty()) ? static_cast<int>(mountain[0].size()) : 0;

    if (DEBUG) 
        std::cout << "mountain height : "<< height <<" width : "<<width<<std::endl;

    // Protection contre les tailles nulles
    if (height == 0 || width == 0) {
        std::cerr << "[ERREUR update_world] Matrice montagne vide (height=0 ou width=0)" << std::endl;
        return;
    }
    
    // Calculer la taille des cellules pour s'adapter à la fenêtre
    cell_width = win_size_x / static_cast<float>(width);
    cell_height = win_size_y / static_cast<float>(height);

    // OPTIMISATION : Utiliser VertexArray au lieu de RectangleShape
    // Cela permet de dessiner toutes les cellules en un seul appel, beaucoup plus rapide
    mountainVertices.clear();
    mountainVertices.setPrimitiveType(sf::PrimitiveType::Triangles);
    
    // Première passe : compter les cellules non-vides pour pré-allouer la mémoire
    int nonEmptyCount = 0;
    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            const std::string& cell = mountain[row][col];
            if (cell == "|" || cell == "_") {
                nonEmptyCount++;
            }
        }
    }
    
    // Pré-allouer la mémoire (6 vertices par cellule = 2 triangles de 3 vertices chacun)
    mountainVertices.resize(nonEmptyCount * 6);
    
    // Deuxième passe : remplir le VertexArray avec seulement les cellules non-vides
    int vertexIndex = 0;
    for (int row = 0; row < height; row++) {
        float y = row * cell_height;
        float y2 = y + cell_height;
        
        for (int col = 0; col < width; col++) {
            const std::string& cell = mountain[row][col];
            
            // Skip les cellules vides (optimisation majeure)
            if (cell != "|" && cell != "_") {
                continue;
            }
            
            // Déterminer la couleur selon le type de terrain
            sf::Color cellColor = (cell == "|") 
                ? sf::Color(100, 100, 100)  // Sommet - gris foncé
                : sf::Color(150, 150, 150); // Base - gris clair
            
            // Calculer les positions des 4 coins de la cellule
            float x = col * cell_width;
            float x2 = x + cell_width;
            
            // Créer deux triangles pour former un rectangle
            // Triangle 1: (x,y) -> (x2,y) -> (x,y2)
            mountainVertices[vertexIndex].position = sf::Vector2f(x, y);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
            
            mountainVertices[vertexIndex].position = sf::Vector2f(x2, y);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
            
            mountainVertices[vertexIndex].position = sf::Vector2f(x, y2);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
            
            // Triangle 2: (x2,y) -> (x2,y2) -> (x,y2)
            mountainVertices[vertexIndex].position = sf::Vector2f(x2, y);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
            
            mountainVertices[vertexIndex].position = sf::Vector2f(x2, y2);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
            
            mountainVertices[vertexIndex].position = sf::Vector2f(x, y2);
            mountainVertices[vertexIndex].color = cellColor;
            vertexIndex++;
        }
    }
    
    // NOTE: On ne crée plus les RectangleShape car ils ne sont plus utilisés
    // Cela économise beaucoup de mémoire et de temps
    
    worldInitialized = true;
    
    if (DEBUG) {
        std::cout << "[UPDATE_WORLD] " << width << "x" << height 
                  << " cells, " << nonEmptyCount << " non-empty cells (" 
                  << (nonEmptyCount * 100.0f / (width * height)) << "% de la matrice)" << std::endl;
    }
}
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
//////////INPUT SFML////////////////////////
////////////////////////////////////////////
/////////////////////////////////////


// Constructeur Input_SFML
Input_SFML::Input_SFML(Output_SFML* output) : output_sfml(output) {
}

Input_SFML::~Input_SFML() {
}

std::string Input_SFML::getKeyName(sf::Keyboard::Key key) {
    switch (key) {
        case sf::Keyboard::Key::A: return "A";
        case sf::Keyboard::Key::B: return "B";
        case sf::Keyboard::Key::C: return "C";
        case sf::Keyboard::Key::D: return "D";
        case sf::Keyboard::Key::E: return "E";
        case sf::Keyboard::Key::F: return "F";
        case sf::Keyboard::Key::G: return "G";
        case sf::Keyboard::Key::H: return "H";
        case sf::Keyboard::Key::I: return "I";
        case sf::Keyboard::Key::J: return "J";
        case sf::Keyboard::Key::K: return "K";
        case sf::Keyboard::Key::L: return "L";
        case sf::Keyboard::Key::M: return "M";
        case sf::Keyboard::Key::N: return "N";
        case sf::Keyboard::Key::O: return "O";
        case sf::Keyboard::Key::P: return "P";
        case sf::Keyboard::Key::Q: return "Q";
        case sf::Keyboard::Key::R: return "R";
        case sf::Keyboard::Key::S: return "S";
        case sf::Keyboard::Key::T: return "T";
        case sf::Keyboard::Key::U: return "U";
        case sf::Keyboard::Key::V: return "V";
        case sf::Keyboard::Key::W: return "W";
        case sf::Keyboard::Key::X: return "X";
        case sf::Keyboard::Key::Y: return "Y";
        case sf::Keyboard::Key::Z: return "Z";
        case sf::Keyboard::Key::Num0: return "0";
        case sf::Keyboard::Key::Num1: return "1";
        case sf::Keyboard::Key::Num2: return "2";
        case sf::Keyboard::Key::Num3: return "3";
        case sf::Keyboard::Key::Num4: return "4";
        case sf::Keyboard::Key::Num5: return "5";
        case sf::Keyboard::Key::Num6: return "6";
        case sf::Keyboard::Key::Num7: return "7";
        case sf::Keyboard::Key::Num8: return "8";
        case sf::Keyboard::Key::Num9: return "9";
        case sf::Keyboard::Key::Space: return "ESPACE";
        case sf::Keyboard::Key::Enter: return "ENTREE";
        case sf::Keyboard::Key::Escape: return "ECHAP";
        case sf::Keyboard::Key::Left: return "left";
        case sf::Keyboard::Key::Right: return "right";
        case sf::Keyboard::Key::Up: return "up";
        case sf::Keyboard::Key::Down: return "down";
        case sf::Keyboard::Key::LShift: return "MAJ_GAUCHE";
        case sf::Keyboard::Key::RShift: return "MAJ_DROITE";
        case sf::Keyboard::Key::LControl: return "CTRL_GAUCHE";
        case sf::Keyboard::Key::RControl: return "CTRL_DROITE";
        case sf::Keyboard::Key::LAlt: return "ALT_GAUCHE";
        case sf::Keyboard::Key::RAlt: return "ALT_DROITE";
        default: return "TOUCHE_INCONNUE";
    }
}

int Input_SFML::check_input() {
    //while (output_sfml->getWindow().isOpen()) {
        // Gestion des événements
        while (const std::optional<sf::Event> event = output_sfml->getWindow().pollEvent()) {
            if (event.has_value()) {
                if (event->is<sf::Event::Closed>()) {
                    output_sfml->getWindow().close();
                    g_stop_flag.store(true);
                }
            }
        }

        // Vérification des touches actuellement pressées
        pressedKeys.clear();
        
        // Liste des touches à vérifier
        std::vector<sf::Keyboard::Key> keysToCheck = {
            sf::Keyboard::Key::A, sf::Keyboard::Key::B, sf::Keyboard::Key::C, sf::Keyboard::Key::D, sf::Keyboard::Key::E,
            sf::Keyboard::Key::F, sf::Keyboard::Key::G, sf::Keyboard::Key::H, sf::Keyboard::Key::I, sf::Keyboard::Key::J,
            sf::Keyboard::Key::K, sf::Keyboard::Key::L, sf::Keyboard::Key::M, sf::Keyboard::Key::N, sf::Keyboard::Key::O,
            sf::Keyboard::Key::P, sf::Keyboard::Key::Q, sf::Keyboard::Key::R, sf::Keyboard::Key::S, sf::Keyboard::Key::T,
            sf::Keyboard::Key::U, sf::Keyboard::Key::V, sf::Keyboard::Key::W, sf::Keyboard::Key::X, sf::Keyboard::Key::Y, sf::Keyboard::Key::Z,
            sf::Keyboard::Key::Num0, sf::Keyboard::Key::Num1, sf::Keyboard::Key::Num2, sf::Keyboard::Key::Num3, sf::Keyboard::Key::Num4,
            sf::Keyboard::Key::Num5, sf::Keyboard::Key::Num6, sf::Keyboard::Key::Num7, sf::Keyboard::Key::Num8, sf::Keyboard::Key::Num9,
            sf::Keyboard::Key::Space, sf::Keyboard::Key::Enter, sf::Keyboard::Key::Escape,
            sf::Keyboard::Key::Left, sf::Keyboard::Key::Right, sf::Keyboard::Key::Up, sf::Keyboard::Key::Down,
            sf::Keyboard::Key::LShift, sf::Keyboard::Key::RShift,
            sf::Keyboard::Key::LControl, sf::Keyboard::Key::RControl,
            sf::Keyboard::Key::LAlt, sf::Keyboard::Key::RAlt
        };
        
        // Vérifier chaque touche
        for (const auto& key : keysToCheck) {
            if (sf::Keyboard::isKeyPressed(key)) {
                pressedKeys.push_back(getKeyName(key));
            }
        }

        std::cout << "pressedKeys: " ;
        for (const auto& key : pressedKeys) {
            std::cout << key << " ";
        }
        std::cout << std::endl;
        // Mise à jour de l'affichage
        /*
        std::string displayText;
        if (pressedKeys.empty()) {
            displayText = "Aucune touche active";
        } else {
            displayText = "Touches actives: ";
            for (size_t i = 0; i < pressedKeys.size(); ++i) {
                displayText += pressedKeys[i];
                if (i < pressedKeys.size() - 1) {
                    displayText += ", ";
                }
            }
        }
        //output_sfml->getKeysText().setString(displayText);

        // Rendu
        output_sfml->getWindow().clear(sf::Color::Black);
        
        // Afficher la montagne
        for (const auto& row : output_sfml->getMountainShapes()) {
            for (const auto& shape : row) {
                output_sfml->getWindow().draw(shape);
            }
        }
        
        //output_sfml->getWindow().draw(output_sfml->getKeyboardText());
        //output_sfml->getWindow().draw(output_sfml->getKeysText());
        output_sfml->getWindow().display();*/
    
    return 0;
}


