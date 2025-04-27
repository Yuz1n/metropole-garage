import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onNUIMessage } from './nui/nui';
import { Vehicle } from './types/vehicle';
import Spinner from './components/Spinner';
import './App.css';

const vehicleImages: { [key: string]: string } = {
  adder: 'assets/images/adder.jpg',
  comet2: 'assets/images/comet2.webp',
  zentorno: 'assets/images/zentorno.webp',
  jester: 'assets/images/jester.webp',
  banshee: 'assets/images/banshee.webp',
  elegy: 'assets/images/elegy.webp',
};

const normalizeModelName = (model: string): string => {
  return model.toLowerCase().replace(/\s+/g, '');
};

const App = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSpawnVehicle = (plate: string) => {
    setLoading(true);
    setError(null);
    fetch(`https://metropoleGarage/spawnVehicle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              const errorData = JSON.parse(text);
              if (errorData.errorCode === 'ALREADY_SPAWNED') {
                toast.error('Veículo já está na cidade.', {
                  style: {
                    background: '#333',
                    color: '#ff0000',
                    border: '1px solid #ff0000',
                  },
                });
              } else {
                throw new Error(errorData.message || 'Falha ao spawnar veículo');
              }
            } catch (e) {
              throw new Error(text || 'Falha ao spawnar veículo');
            }
          });
        }
        setLoading(false);
        /*toast.success('Veículo retirado com sucesso!', {
          style: {
            background: '#333',
            color: '#39FF14',
            border: '1px solid #39FF14',
          },
        });*/
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        toast.error(err.message, {
          style: {
            background: '#333',
            color: '#ff0000',
            border: '1px solid #ff0000',
          },
        });
      });
  };

  const handleAdminSpawnVehicle = (plate: string) => {
    setLoading(true);
    setError(null);
    fetch(`https://metropoleGarage/adminSpawnVehicle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            try {
              const errorData = JSON.parse(text);
              if (errorData.errorCode === 'ALREADY_SPAWNED') {
                toast.error('Veículo já está na cidade.', {
                  style: {
                    background: '#333',
                    color: '#ff0000',
                    border: '1px solid #ff0000',
                  },
                });
              } else {
                throw new Error(errorData.message || 'Falha ao spawnar veículo (admin)');
              }
            } catch (e) {
              throw new Error(text || 'Falha ao spawnar veículo (admin)');
            }
          });
        }
        setLoading(false);
        toast.success('Veículo spawnado (admin) com sucesso!', {
          style: {
            background: '#333',
            color: '#39FF14',
            border: '1px solid #39FF14',
          },
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        toast.error(err.message, {
          style: {
            background: '#333',
            color: '#ff0000',
            border: '1px solid #ff0000',
          },
        });
      });
  };

  const handleClose = () => {
    fetch(`https://metropoleGarage/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  };

  useEffect(() => {
    onNUIMessage((message) => {
      switch (message.action) {
        case 'openGarage':
          setIsVisible(true);
          break;
        case 'closeUI': // Ajustado para 'closeUI' conforme o código fornecido
          setIsVisible(false);
          setVehicles([]);
          break;
        case 'setVehicles':
          setVehicles(message.vehicles || []);
          break;
        case 'spawnSuccess':
          setLoading(false);
          toast.success('Veículo retirado com sucesso!', {
            style: {
              background: '#333',
              color: '#39FF14',
              border: '1px solid #39FF14',
            },
          });
          break;
        case 'spawnError':
          setLoading(false);
          try {
            const errorData = message.error ? JSON.parse(message.error) : { message: 'Erro desconhecido', errorCode: '' };
            if (errorData.errorCode === 'ALREADY_SPAWNED') {
              toast.error('Veículo já está na cidade.', {
                style: {
                  background: '#333',
                  color: '#ff0000',
                  border: '1px solid #ff0000',
                },
              });
            } else {
              setError(errorData.message || 'Erro ao spawnar veículo');
              toast.error(errorData.message || 'Erro ao spawnar veículo', {
                style: {
                  background: '#333',
                  color: '#ff0000',
                  border: '1px solid #ff0000',
                },
              });
            }
          } catch (e) {
            setError('Erro ao processar mensagem de erro');
            toast.error('Erro ao processar mensagem de erro', {
              style: {
                background: '#333',
                color: '#ff0000',
                border: '1px solid #ff0000',
              },
            });
          }
          break;
        case 'setAdmin':
          setIsAdmin(message.isAdmin || false);
          break;
        default:
          console.log('Ação desconhecida:', message.action);
      }
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <Toaster position="top-right" />
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-4xl relative">
        <h1 className="text-3xl font-bold text-neonGreen mb-4 text-center font-orbitron">Garagem Metrópole</h1>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Fechar
        </button>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhum veículo encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-800 rounded-lg p-4 flex flex-col items-center transform hover:scale-105 transition duration-300"
              >
                <img
                  src={vehicleImages[normalizeModelName(vehicle.model)] || 'assets/images/default.jpg'}
                  alt={vehicle.model}
                  className="w-32 h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-neonPink">{vehicle.model}</h3>
                <p className="text-gray-300 mb-4">Placa: {vehicle.plate}</p>
                <p className="text-gray-300 mb-4">Cor: {vehicle.color}</p>
                <button
                  onClick={() => handleSpawnVehicle(vehicle.plate)}
                  disabled={loading}
                  className="bg-neonGreen hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition duration-300"
                >
                  Retirar Carro
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleAdminSpawnVehicle(vehicle.plate)}
                    disabled={loading}
                    className="bg-neonPink hover:bg-pink-600 text-white font-bold py-2 px-4 rounded mt-2 transition duration-300"
                  >
                    Spawnar (Admin)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {loading && <Spinner />}
      </div>
    </div>
  );
};

export default App;