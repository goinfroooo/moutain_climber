#include "IO_SFML.h"
#include "Player.h"
#include <iostream>
#include <string>
// #include <optional>  // Non nécessaire avec SFML 2.x


// Constructeur Output_SFML
Output_SFML::Output_SFML(std::vector<std::vector<std::string>> mountain) :
    window(sf::VideoMode({static_cast<unsigned int>(win_size_x), static_cast<unsigned int>(win_size_y)}), "SFML Test - Touches Actives")
    //i on initialise le texte avec une chaîne vide et la police
    {
    
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


void Output_SFML::render_world(const std::vector<std::vector<std::string>>& mountain, const Player& player) {
    // Initialiser le vecteur de formes de montagne
    int height = mountain.size();
    int width = height > 0 ? mountain[0].size() : 0;

    if (DEBUG) 
        std::cout << "moutain height : "<< height <<" width : "<<width<<std::endl;
    
    
    // Redimensionner le vecteur de formes
    mountainShapes.resize(height, std::vector<sf::RectangleShape>(width));
    
    // Calculer la taille des cellules pour s'adapter à la fenêtre
    float cell_width = win_size_x / static_cast<float>(width);
    float cell_height = win_size_y / static_cast<float>(height);
    
    // Créer les formes pour chaque cellule de la montagne
    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            sf::RectangleShape& shape = mountainShapes[row][col];
            
            // Définir la taille de la cellule
            shape.setSize(sf::Vector2f(cell_width, cell_height));
            
            // Positionner la cellule
            shape.setPosition(sf::Vector2f(col * cell_width, row * cell_height));
            
            // Définir la couleur selon le type de terrain
            if (mountain[row][col] == "|") {
                // Sommet de montagne - couleur gris foncé
                shape.setFillColor(sf::Color(100, 100, 100));
            } else if (mountain[row][col] == "_") {
                // Base de montagne - couleur gris clair
                shape.setFillColor(sf::Color(150, 150, 150));
            } else {
                // Espace vide - couleur bleu ciel (ciel)
                shape.setFillColor(sf::Color(0, 0, 0, 0));   // Transparent
                shape.setOutlineThickness(0);                // pas de contour
            }
            
            // Ajouter une bordure pour délimiter les cellules
            shape.setOutlineThickness(0.9f);
            shape.setOutlineColor(sf::Color(50, 50, 50));
        }
    }

    // Ajout du joueur
    sf::CircleShape playerShape(10.0f);
    playerShape.setPosition(sf::Vector2f(static_cast<float>(player.get_x()), static_cast<float>(player.get_y())));
    playerShape.setFillColor(sf::Color::Red);

    // Ajout du rendu initial : affichage du contenu de mountainShapes dans la fenêtre SFML
    window.clear();
    for (int row = 0; row < height; row++) {
        for (int col = 0; col < width; col++) {
            window.draw(mountainShapes[row][col]);
        }
    }
    window.draw(playerShape);
    window.display();
    std::cout << "Montagne rendue: " << width << "x" << height << " cellules" << std::endl;
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
        case sf::Keyboard::Key::Left: return "FLECHE_GAUCHE";
        case sf::Keyboard::Key::Right: return "FLECHE_DROITE";
        case sf::Keyboard::Key::Up: return "FLECHE_HAUT";
        case sf::Keyboard::Key::Down: return "FLECHE_BAS";
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
            if (event->is<sf::Event::Closed>()) {
                output_sfml->getWindow().close();
                g_stop_flag.store(true);
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
