CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -pthread 
SFML_INCLUDES = -I/C/msys64/mingw64/include
SFML_LIBS = -L/C/msys64/mingw64/lib -lsfml-graphics -lsfml-window -lsfml-system
TARGET = rock_climber
SOURCES = main.cpp GameState.cpp WindSystem.cpp RockfallSystem.cpp Player.cpp IO_SFML.cpp

$(TARGET): $(SOURCES)
	$(CXX) $(CXXFLAGS) $(SFML_INCLUDES) -o $(TARGET) $(SOURCES) $(SFML_LIBS)

clean:
	rm -f $(TARGET)

.PHONY: clean

# Pour Windows avec MinGW
ifeq ($(OS),Windows_NT)
    $(TARGET).exe: $(SOURCES)
		$(CXX) $(CXXFLAGS) $(SFML_INCLUDES) -o $(TARGET).exe $(SOURCES) $(SFML_LIBS)
endif
