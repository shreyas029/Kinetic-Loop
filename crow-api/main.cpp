
#include "crow.h"
#include <cstdlib>
#include <string>

int main() {
    crow::SimpleApp app;

    // Health check endpoint
    CROW_ROUTE(app, "/")([]() {
        return crow::json::wvalue{
            {"message", "KINETIC LOOP C++ API is running"},
            {"framework", "Crow"},
            {"language", "C++"}
        };
    });

    // Bonus API: energy harvesting estimate
    CROW_ROUTE(app, "/api/energy/<int>")
    ([](int steps) {
        if (steps < 0) {
            return crow::response(400, "Steps cannot be negative");
        }

        // Demonstration estimate, not a measured energy output
        double estimatedEnergy = steps * 0.0005;

        crow::json::wvalue result;
        result["steps"] = steps;
        result["estimated_energy_mWh"] = estimatedEnergy;
        result["technology"] = "Motion Energy Harvesting";
        result["note"] = "Illustrative estimate only";

        return crow::response(200, result);
    });

    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

    app.port(port).multithreaded().run();
}
