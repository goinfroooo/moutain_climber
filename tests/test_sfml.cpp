#include <SFML/Graphics.hpp>
#include <string>
#include <iostream>
#include <vector>
#include <algorithm>

std::string getKeyName(sf::Keyboard::Key key) {
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

int main() {
    sf::RenderWindow window(sf::VideoMode({800, 600}), "SFML Test - Touches Actives");
    
    // Chargement de la police système Windows
    sf::Font font;
    if (!font.openFromFile("C:/Windows/Fonts/arial.ttf")) {
        std::cout << "Impossible de charger la police Arial" << std::endl;
    }
    
    // Texte pour afficher les touches actives
    sf::Text keyboardText(font, "Touches actives:", 20);
    keyboardText.setFillColor(sf::Color::White);
    keyboardText.setPosition({50, 50});
    
    // Texte pour la liste des touches
    sf::Text keysText(font, "", 18);
    keysText.setFillColor(sf::Color::Yellow);
    keysText.setPosition({50, 80});
    
    // Cercle décoratif
    sf::CircleShape shape(100.f);
    shape.setFillColor(sf::Color::Green);
    shape.setPosition({500, 200});

    while (window.isOpen()) {
        // Gestion des événements
        while (const std::optional<sf::Event> event = window.pollEvent()) {
            if (event->is<sf::Event::Closed>()) {
                window.close();
            }
        }

        // Vérification des touches actuellement pressées
        std::vector<std::string> pressedKeys;
        
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
        
        // Mise à jour de l'affichage
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
        keysText.setString(displayText);

        // Rendu
        window.clear(sf::Color::Black);
        window.draw(shape);
        window.draw(keyboardText);
        window.draw(keysText);
        window.display();
    }
    return 0;
}
