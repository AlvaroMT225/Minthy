import { useState } from 'react'
import { Bluetooth, BluetoothOff, BluetoothSearching, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'

type BluetoothState = 'disconnected' | 'searching' | 'connected' | 'error'

interface BluetoothStatusProps {
  state: BluetoothState
  deviceName?: string
  onSearch: () => void
  onDisconnect: () => void
}

export function BluetoothStatus({
  state,
  deviceName,
  onSearch,
  onDisconnect
}: BluetoothStatusProps) {
  const [open, setOpen] = useState(false)

  // Configuración visual por estado (colores oscuros para fondo blanco)
  const stateConfig = {
    disconnected: {
      icon: BluetoothOff,
      text: 'Desconectado',
      iconColor: '#6b7280',
      textColor: '#374151',
    },
    searching: {
      icon: BluetoothSearching,
      text: 'Buscando...',
      iconColor: '#f59e0b',
      textColor: '#b45309',
    },
    connected: {
      icon: Bluetooth,
      text: 'Conectado',
      iconColor: '#3b82f6',
      textColor: '#111827',
    },
    error: {
      icon: BluetoothOff,
      text: 'Error BLE',
      iconColor: '#ef4444',
      textColor: '#991b1b',
    },
  }

  const config = stateConfig[state]
  const Icon = config.icon

  // Color del círculo de estado
  const getCircleColor = () => {
    if (state === 'connected') return '#22c55e' // Verde
    if (state === 'searching') return '#f59e0b' // Amarillo/Ámbar
    return '#ef4444' // Rojo
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            outline: 'none',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            minWidth: '160px',
            padding: '10px 16px',
            gap: '12px',
            height: '44px',
            overflow: 'visible',
          }}
        >
          {/* Círculo de estado */}
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getCircleColor(),
              display: 'block',
              flexShrink: 0,
            }}
          />
          <Icon style={{ width: '20px', height: '20px', color: config.iconColor, flexShrink: 0 }} />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: config.textColor,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'block',
              lineHeight: '1',
              visibility: 'visible',
              opacity: 1,
            }}
          >
            {config.text}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        style={{
          minWidth: '280px',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          padding: '8px 0',
          backgroundColor: '#ffffff',
          zIndex: 9999,
        }}
      >
        {/* Header - Información del dispositivo */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px 8px 0 0',
            marginBottom: '8px'
          }}
        >
          {state === 'connected' && deviceName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bluetooth style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>
                  {deviceName}
                </p>
                <p style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'inline-block'
                    }}
                  />
                  Conectado
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BluetoothOff style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280', marginBottom: '2px' }}>
                  No hay dispositivo
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Desconectado
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <DropdownMenuSeparator style={{ margin: '8px 0', backgroundColor: '#e5e7eb' }} />

        {/* Botón Buscar */}
        <DropdownMenuItem
          onClick={() => {
            onSearch()
            setOpen(false)
          }}
          style={{
            padding: '12px 16px',
            minHeight: '44px',
            cursor: 'pointer',
            margin: '0 4px',
            borderRadius: '8px',
            color: '#2563eb'
          }}
          className="hover:bg-blue-50"
        >
          <Search style={{ width: '20px', height: '20px', color: '#2563eb', marginRight: '12px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {state === 'connected' ? 'Buscar nuevo' : 'Buscar dispositivo'}
          </span>
        </DropdownMenuItem>

        {/* Botón Desconectar (solo si conectado) */}
        {state === 'connected' && (
          <DropdownMenuItem
            onClick={() => {
              onDisconnect()
              setOpen(false)
            }}
            style={{
              padding: '12px 16px',
              minHeight: '44px',
              cursor: 'pointer',
              margin: '0 4px',
              borderRadius: '8px',
              color: '#dc2626'
            }}
            className="hover:bg-red-50"
          >
            <BluetoothOff style={{ width: '20px', height: '20px', color: '#dc2626', marginRight: '12px' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Desconectar</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
