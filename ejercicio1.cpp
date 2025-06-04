#include <iostream>
#include <pthread.h>

using namespace std;

// Arrays con valores del 1 al 5
int array1[5] = {1, 2, 3, 4, 5};
int array2[5] = {1, 2, 3, 4, 5};

// Variables para guardar resultados
int resultado1 = 0;
int resultado2 = 0;
int resultado3 = 0;
int resultado4 = 0;
int resultado5 = 0;

// Hilo 1: Suma array1[0] + array2[0]
void* hilo1(void* arg) {
    resultado1 = array1[0] + array2[0];
    cout << "Hilo 1: Suma " << array1[0] << " + " << array2[0] << " = " << resultado1 << endl;
    return nullptr;
}

// Hilo 2: Suma array1[1] + array2[1]
void* hilo2(void* arg) {
    resultado2 = array1[1] + array2[1];
    cout << "Hilo 2: Suma " << array1[1] << " + " << array2[1] << " = " << resultado2 << endl;
    return nullptr;
}

// Hilo 3: Suma array1[2] + array2[2]
void* hilo3(void* arg) {
    resultado3 = array1[2] + array2[2];
    cout << "Hilo 3: Suma " << array1[2] << " + " << array2[2] << " = " << resultado3 << endl;
    return nullptr;
}

// Hilo 4: Suma los tres resultados anteriores y luego los multiplica por array1[3] y array2[3]
void* hilo4(void* arg) {
    int suma_total = resultado1 + resultado2 + resultado3;
    cout << "Hilo 4: Suma total = " << suma_total << endl;
    resultado4 = suma_total * array1[3] * array2[3];
    cout << "Hilo 4: Multiplicación " << suma_total << " * " << array1[3]
         << " * " << array2[3] << " = " << resultado4 << endl;
    return nullptr;
}

// Hilo 5: Le suma array1[4] y array2[4] al resultado anterior
void* hilo5(void* arg) {
    resultado5 = resultado4 + array1[4] + array2[4];
    cout << "Hilo 5: " << resultado4 << " + " << array1[4] << " + " << array2[4]
         << " = " << resultado5 << endl;
    return nullptr;
}

int main() {
    // Declarar hilos
    pthread_t h1, h2, h3, h4, h5;

    // Crear y esperar el hilo 1
    pthread_create(&h1, nullptr, hilo1, nullptr);
    pthread_join(h1, nullptr);

    // Crear y esperar el hilo 2
    pthread_create(&h2, nullptr, hilo2, nullptr);
    pthread_join(h2, nullptr);

    // Crear y esperar el hilo 3
    pthread_create(&h3, nullptr, hilo3, nullptr);
    pthread_join(h3, nullptr);

    // Crear y esperar el hilo 4
    pthread_create(&h4, nullptr, hilo4, nullptr);
    pthread_join(h4, nullptr);

    // Crear y esperar el hilo 5
    pthread_create(&h5, nullptr, hilo5, nullptr);
    pthread_join(h5, nullptr);

    // Mostrar resultado final
    cout << "Resultado final: " << resultado5 << endl;

    return 0;
}
