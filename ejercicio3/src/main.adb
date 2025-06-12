with Ada.Text_IO; use Ada.Text_IO;
with Ada.Integer_Text_IO; use Ada.Integer_Text_IO;
with Ada.Numerics.Discrete_Random;

procedure Main is
   -- Definimos packete de numeros alateorios
   package Random_Time is new Ada.Numerics.Discrete_Random(Integer);
   use Random_Time;

   Gen : Generator;


   -- Constantes
   Max_Cajas     : constant Integer := 4;     -- Número total de cajas disponibles
   Max_Cola      : constant Integer := 10;    -- Tamaño máximo de la cola de espera

   -- Tipos para representar personas y cajas
   type Persona_Id is new Integer;
   type Caja_Id is range 1 .. Max_Cajas;

   -- Estructuras para la cola y el estado de las cajas
   type Cola_Tipo is array (1 .. Max_Cola) of Persona_Id;
   type Estado_Cajas_Tipo is array (Caja_Id) of Boolean;
   type Tiempos_Tipo is array (Caja_Id) of Integer;
   type Personas_Caja_Tipo is array (Caja_Id) of Persona_Id;

   Cola : Cola_Tipo;                          -- Cola de espera de personas
   Inicio : Integer := 1;
   Fin    : Integer := 0;
   Total  : Integer := 0;        

   Estado_Cajas : Estado_Cajas_Tipo := (others => False); -- Todas las cajas están inicialmente libres
   Tiempos_Cajas : Tiempos_Tipo := (others => 0);
   Personas_Atendidas : Personas_Caja_Tipo := (others => -1);

   Siguiente_Persona : Persona_Id := 1;       -- ID incremental para las personas
   Total_Personas : Integer;                  -- Cantidad total de personas a procesar

   -- Devuelve el siguiente índice cíclico en el rango 1..Max_Cola
   function Siguiente_Indice(Indice : Integer) return Integer is
   begin
      if Indice = Max_Cola then
         return 1;
      else
         return Indice + 1;
      end if;
   end Siguiente_Indice;

   -- Devuelve true si hay alguna caja ocupada
   function Hay_Cajas_Ocupadas return Boolean is
   begin
      for C in Caja_Id loop
         if Estado_Cajas(C) then
            return True;
         end if;
      end loop;
      return False;
   end Hay_Cajas_Ocupadas;

   -- Procedimiento para ingresar una persona a la cola
   procedure Entrar_Cola(Id : Persona_Id) is
   begin
      if Total < Max_Cola then
         Fin := Siguiente_Indice(Fin);
         Cola(Fin) := Id;
         Total := Total + 1;
         Put_Line("Usuario" & Integer'Image(Integer(Id)) & " entra a la cola de espera.");
      end if;
   end Entrar_Cola;

   -- Procedimiento para sacar una persona de la cola (la primera)
   procedure Salir_Cola(Id : out Persona_Id) is
   begin
      if Total > 0 then
         Id := Cola(Inicio);
         Inicio := Siguiente_Indice(Inicio);
         Total := Total - 1;
         Put_Line("Usuario" & Integer'Image(Integer(Id)) & " sale de la cola de espera.");
      else
         Id := -1;  -- Marca que no hay nadie para salir
      end if;
   end Salir_Cola;

   -- Revisar cajas: descontar tiempos y liberar si terminó
   procedure Revisar_Cajas is
   begin
      for C in Caja_Id loop
         if Estado_Cajas(C) then
            Tiempos_Cajas(C) := Tiempos_Cajas(C) - 1;
            if Tiempos_Cajas(C) = 0 then
               Put_Line("Persona" & Integer'Image(Integer(Personas_Atendidas(C))) & " saliendo de la caja" & Integer'Image(Integer(C)) & ".");
               Estado_Cajas(C) := False;
               Personas_Atendidas(C) := -1;
            end if;
         end if;
      end loop;
   end Revisar_Cajas;

   -- Atender nuevas personas en cajas libres
   procedure Asignar_Personas is
      Persona : Persona_Id;
   begin
      for C in Caja_Id loop
         if not Estado_Cajas(C) and then Total > 0 then
            Salir_Cola(Persona);
            if Persona /= -1 then
               Estado_Cajas(C) := True;
               Personas_Atendidas(C) := Persona;
               Tiempos_Cajas(C) := Random(Gen) mod 5 + 1;
               Put_Line("Persona" & Integer'Image(Integer(Persona)) & " ingresó a la caja" & Integer'Image(Integer(C)) & ".");
            end if;
         end if;
      end loop;
   end Asignar_Personas;

begin
   Reset(Gen);
   -- Pedimos la cantidad de personas a simular
   Put("Ingrese la cantidad de personas a crear: ");
   Get(Total_Personas);

   -- LLenamos la cola inicialmente
   while (Siguiente_Persona <= Persona_Id(Total_Personas)) and (Total < Max_Cola) loop
      Entrar_Cola(Siguiente_Persona);
      Siguiente_Persona := Siguiente_Persona + 1;
      delay 1.0;
   end loop;

    -- Ciclo principal
   while (Siguiente_Persona <= Persona_Id(Total_Personas)) or (Total > 0) or Hay_Cajas_Ocupadas loop

      -- Simular salida de personas
      Revisar_Cajas;

      -- Llenar cola si hay lugar
      if Siguiente_Persona <= Persona_Id(Total_Personas) then
         if Total < Max_Cola then
            Entrar_Cola(Siguiente_Persona);
            Siguiente_Persona := Siguiente_Persona + 1;
         else
            Put_Line("Cola de espera llena, no se permiten más personas por ahora.");
            delay Duration(Random(Gen) mod 3 + 1);
         end if;
      end if;

      -- Atender nuevas personas
      Asignar_Personas;

      delay 1.0;  -- Simula el paso del tiempo (1 segundo)
   end loop;

end Main;