#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <semaphore.h>
#include <unistd.h>

#define N 15

char *nombres[N] = {
    "IN", "M1", "F1", "QG", "TD", "M2", "FN", "MF",
    "MIN", "RR", "PR", "SR", "INU", "CB", "SN"};

int deps[N][N] = {0};

sem_t sems[N];

int dependientes[N] = {0};

void *cursar(void *x)
{
    int id = *((int *)x);
    free(x);

    for (int i = 0; i < N; i++)
    {
        if (deps[id][i])
        {
            sem_wait(&sems[i]);
        }
    }

    printf("Cursando: %s\n", nombres[id]);
    sleep(1);

    for (int i = 0; i < dependientes[id]; i++)
    {
        sem_post(&sems[id]);
    }

    pthread_exit(NULL);
}

int main()
{
    for (int i = 0; i < N; i++)
    {
        sem_init(&sems[i], 0, 0);
    }

    deps[4][2] = deps[4][3] = 1;     // TD <- F1, QG
    deps[5][1] = 1;                  // M2 <- M1
    deps[6][2] = deps[6][5] = 1;     // FN <- F1, M2
    deps[7][4] = deps[7][5] = 1;     // MF <- TD, M2
    deps[8][3] = deps[8][6] = 1;     // MIN <- QG, FN
    deps[9][6] = 1;                  // RR <- FN
    deps[10][6] = deps[10][8] = 1;   // PR <- FN, MIN
    deps[11][9] = 1;                 // SR <- RR
    deps[12][10] = 1;                // INU <- PR
    deps[13][8] = 1;                 // CB <- MIN
    deps[14][10] = deps[14][11] = 1; // SN <- PR, SR

    for (int i = 0; i < N; i++)
    {
        for (int j = 0; j < N; j++)
        {
            if (deps[j][i])
            {
                dependientes[i]++;
            }
        }
    }

    pthread_t hilos[N];
    pthread_attr_t attr;
    pthread_attr_init(&attr);

    for (int i = 0; i < N; i++)
    {
        int *id = malloc(sizeof(int));
        *id = i;
        pthread_create(&hilos[i], &attr, cursar, id);
    }

    for (int i = 0; i < N; i++)
    {
        int tienePrevia = 0;
        for (int j = 0; j < N; j++)
        {
            if (deps[i][j])
            {
                tienePrevia = 1;
                break;
            }
        }
        if (!tienePrevia)
        {
            for (int k = 0; k < dependientes[i]; k++)
            {
                sem_post(&sems[i]);
            }
        }
    }

    pthread_join(hilos[0], NULL);
    sem_destroy(&sems[0]);

    pthread_join(hilos[1], NULL);
    sem_destroy(&sems[1]);

    pthread_join(hilos[2], NULL);
    sem_destroy(&sems[2]);

    pthread_join(hilos[3], NULL);
    sem_destroy(&sems[3]);

    pthread_join(hilos[4], NULL);
    sem_destroy(&sems[4]);

    pthread_join(hilos[5], NULL);
    sem_destroy(&sems[5]);

    pthread_join(hilos[6], NULL);
    sem_destroy(&sems[6]);

    pthread_join(hilos[7], NULL);
    sem_destroy(&sems[7]);

    pthread_join(hilos[8], NULL);
    sem_destroy(&sems[8]);

    pthread_join(hilos[9], NULL);
    sem_destroy(&sems[9]);

    pthread_join(hilos[10], NULL);
    sem_destroy(&sems[10]);

    pthread_join(hilos[11], NULL);
    sem_destroy(&sems[11]);

    pthread_join(hilos[12], NULL);
    sem_destroy(&sems[12]);

    pthread_join(hilos[13], NULL);
    sem_destroy(&sems[13]);

    pthread_join(hilos[14], NULL);
    sem_destroy(&sems[14]);

    return 0;
}