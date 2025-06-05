#include <stdio.h>
#include <pthread.h>

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
    printf("Hilo 1: Suma %d + %d = %d\n", array1[0], array2[0], resultado1);
    return NULL;
}

// Hilo 2: Suma array1[1] + array2[1]
void* hilo2(void* arg) {
    resultado2 = array1[1] + array2[1];
    printf("Hilo 2: Suma %d + %d = %d\n", array1[1], array2[1], resultado2);
    return NULL;
}

// Hilo 3: Suma array1[2] + array2[2]
void* hilo3(void* arg) {
    resultado3 = array1[2] + array2[2];
    printf("Hilo 3: Suma %d + %d = %d\n", array1[2], array2[2], resultado3);
    return NULL;
}

// Hilo 4: Suma los tres resultados y multiplica por array1[3] y array2[3]
void* hilo4(void* arg) {
    int suma_total = resultado1 + resultado2 + resultado3;
    printf("Hilo 4: Suma total = %d\n", suma_total);
    resultado4 = suma_total * array1[3] * array2[3];
    printf("Hilo 4: Multiplicación %d * %d * %d = %d\n", suma_total, array1[3], array2[3], resultado4);
    return NULL;
}

// Hilo 5: Suma resultado4 + array1[4] + array2[4]
void* hilo5(void* arg) {
    resultado5 = resultado4 + array1[4] + array2[4];
    printf("Hilo 5: %d + %d + %d = %d\n", resultado4, array1[4], array2[4], resultado5);
    return NULL;
}

int main() {
    pthread_t h1, h2, h3, h4, h5;

    pthread_create(&h1, NULL, hilo1, NULL);
    pthread_join(h1, NULL);

    pthread_create(&h2, NULL, hilo2, NULL);
    pthread_join(h2, NULL);

    pthread_create(&h3, NULL, hilo3, NULL);
    pthread_join(h3, NULL);

    pthread_create(&h4, NULL, hilo4, NULL);
    pthread_join(h4, NULL);

    pthread_create(&h5, NULL, hilo5, NULL);
    pthread_join(h5, NULL);

    printf("Resultado final: %d\n", resultado5);

    return 0;
}
