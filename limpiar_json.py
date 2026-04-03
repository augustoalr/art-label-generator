import json
import re

def limpiar_json(archivo_entrada, archivo_salida):
    """
    Limpia los valores de 'asset_number' en un archivo JSON.

    Esta función lee un archivo JSON, elimina espacios en blanco,
    prefijos no numéricos (como 'MPPRE: ') y espacios alrededor de las barras ('/')
    de los valores asociados a la clave 'asset_number', y guarda el resultado
    en un nuevo archivo.

    Args:
        archivo_entrada (str): La ruta del archivo JSON que se va a limpiar.
        archivo_salida (str): La ruta donde se guardará el JSON limpio.
    """
    try:
        # 1. Abrir y cargar el archivo JSON de entrada
        with open(archivo_entrada, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 2. Recorrer los datos para limpiarlos
        # Verificamos si los datos son una lista de objetos o un solo objeto
        if isinstance(data, list):
            # Si es una lista, iteramos sobre cada elemento
            for item in data:
                if 'asset_number' in item and isinstance(item['asset_number'], str):
                    valor_limpio = item['asset_number']
                    # a. Eliminar espacios en blanco al inicio y al final
                    valor_limpio = valor_limpio.strip()
                    # b. Eliminar prefijos no numéricos (ej. "MPPRE: ")
                    valor_limpio = re.sub(r'^\D*\s*', '', valor_limpio)
                    # c. NUEVO: Eliminar espacios alrededor de la barra '/'
                    valor_limpio = valor_limpio.replace(' / ', '/')
                    item['asset_number'] = valor_limpio
        elif isinstance(data, dict):
            # Si es un solo objeto, procesamos directamente
            if 'asset_number' in data and isinstance(data['asset_number'], str):
                valor_limpio = data['asset_number']
                valor_limpio = valor_limpio.strip()
                valor_limpio = re.sub(r'^\D*\s*', '', valor_limpio)
                valor_limpio = valor_limpio.replace(' / ', '/')
                data['asset_number'] = valor_limpio

        # 3. Guardar los datos limpios en el archivo de salida
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            # indent=4 hace que el archivo de salida sea legible
            # ensure_ascii=False permite guardar caracteres especiales como la 'ñ'
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"¡Éxito! ✨ El archivo ha sido limpiado y guardado como '{archivo_salida}'")

    except FileNotFoundError:
        print(f"Error: No se encontró el archivo '{archivo_entrada}'. Verifica el nombre y la ruta.")
    except json.JSONDecodeError:
        print(f"Error: El archivo '{archivo_entrada}' no tiene un formato JSON válido.")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")

# --- Ejemplo de uso ---
# Nombre del archivo que quieres limpiar
nombre_archivo_original = 'data.json'

# Nombre que tendrá el archivo limpio
nombre_archivo_limpio = 'datos_limpios.json'

# Llamamos a la función para que haga la limpieza
limpiar_json(nombre_archivo_original, nombre_archivo_limpio)