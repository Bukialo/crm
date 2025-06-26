// src/pages/settings/SettingsPage.tsx
import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Palette,
  Settings as SettingsIcon,
  Save,
  Check,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Calendar,
  DollarSign,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "+54 11 1234-5678",
    timezone: "America/Argentina/Buenos_Aires",
    language: "es",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newContacts: true,
    tripUpdates: true,
    paymentReminders: true,
    weeklyReports: true,
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: "Bukialo Travel",
    companyEmail: "info@bukialo.com",
    companyPhone: "+54 11 1234-5678",
    companyAddress: "Av. Principal 123, Ciudad",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
  });

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "company", label: "Empresa", icon: SettingsIcon },
    { id: "integrations", label: "Integraciones", icon: Globe },
    { id: "appearance", label: "Apariencia", icon: Palette },
  ];

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveMessage("Configuración guardada exitosamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Error al guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Información Personal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={profileData.firstName}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Tu nombre"
          />
          <Input
            label="Apellido"
            value={profileData.lastName}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Tu apellido"
          />
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="tu@email.com"
          />
          <Input
            label="Teléfono"
            value={profileData.phone}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+54 11 1234-5678"
            leftIcon={<Smartphone className="w-4 h-4" />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Preferencias Regionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Zona Horaria
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
              className="glass w-full px-3 py-2 rounded-lg text-white"
            >
              <option value="America/Argentina/Buenos_Aires">
                Buenos Aires (GMT-3)
              </option>
              <option value="America/New_York">Nueva York (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Idioma
            </label>
            <select
              value={profileData.language}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="glass w-full px-3 py-2 rounded-lg text-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        onClick={() => handleSave("profile")}
        isLoading={isLoading}
        leftIcon={<Save className="w-4 h-4" />}
        variant="primary"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Canales de Notificación
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "emailNotifications",
              label: "Notificaciones por Email",
              icon: Mail,
            },
            {
              key: "pushNotifications",
              label: "Notificaciones Push",
              icon: Bell,
            },
            {
              key: "smsNotifications",
              label: "Notificaciones SMS",
              icon: Smartphone,
            },
          ].map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 glass rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-white/60" />
                <span className="text-white">{label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    notificationSettings[
                      key as keyof typeof notificationSettings
                    ] as boolean
                  }
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Tipos de Notificaciones
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "newContacts",
              label: "Nuevos contactos",
              description: "Cuando se registra un nuevo contacto",
            },
            {
              key: "tripUpdates",
              label: "Actualizaciones de viajes",
              description: "Cambios en reservas y confirmaciones",
            },
            {
              key: "paymentReminders",
              label: "Recordatorios de pago",
              description: "Pagos pendientes y vencimientos",
            },
            {
              key: "weeklyReports",
              label: "Reportes semanales",
              description: "Resumen de actividad semanal",
            },
          ].map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 glass rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-white/60 text-sm">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    notificationSettings[
                      key as keyof typeof notificationSettings
                    ] as boolean
                  }
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => handleSave("notifications")}
        isLoading={isLoading}
        leftIcon={<Save className="w-4 h-4" />}
        variant="primary"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Cambiar Contraseña
        </h3>
        <div className="space-y-4">
          <Input
            label="Contraseña Actual"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña actual"
            leftIcon={<Key className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/60 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
          <Input
            label="Nueva Contraseña"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            leftIcon={<Key className="w-4 h-4" />}
          />
          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            leftIcon={<Key className="w-4 h-4" />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Autenticación de Dos Factores
        </h3>
        <div className="p-4 glass rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Habilitar 2FA</p>
              <p className="text-white/60 text-sm">
                Agrega una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Button variant="glass">Configurar</Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Sesiones Activas
        </h3>
        <div className="space-y-3">
          {[
            {
              device: "Chrome en Windows",
              location: "Buenos Aires, Argentina",
              current: true,
            },
            {
              device: "Safari en iPhone",
              location: "Buenos Aires, Argentina",
              current: false,
            },
          ].map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 glass rounded-lg"
            >
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                      Actual
                    </span>
                  )}
                </p>
                <p className="text-white/60 text-sm">{session.location}</p>
              </div>
              {!session.current && (
                <Button variant="danger" size="sm">
                  Cerrar Sesión
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => handleSave("security")}
        isLoading={isLoading}
        leftIcon={<Save className="w-4 h-4" />}
        variant="primary"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Información de la Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Empresa"
            value={companySettings.companyName}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                companyName: e.target.value,
              }))
            }
            placeholder="Bukialo Travel"
          />
          <Input
            label="Email de Contacto"
            type="email"
            value={companySettings.companyEmail}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                companyEmail: e.target.value,
              }))
            }
            placeholder="info@bukialo.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Teléfono de Contacto"
            value={companySettings.companyPhone}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                companyPhone: e.target.value,
              }))
            }
            placeholder="+54 11 1234-5678"
            leftIcon={<Smartphone className="w-4 h-4" />}
          />
          <Input
            label="Dirección"
            value={companySettings.companyAddress}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                companyAddress: e.target.value,
              }))
            }
            placeholder="Av. Principal 123, Ciudad"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Configuración Regional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Moneda
            </label>
            <select
              value={companySettings.currency}
              onChange={(e) =>
                setCompanySettings((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="glass w-full px-3 py-2 rounded-lg text-white"
            >
              <option value="ARS">Peso Argentino (ARS)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Zona Horaria
            </label>
            <select
              value={companySettings.timezone}
              onChange={(e) =>
                setCompanySettings((prev) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
              className="glass w-full px-3 py-2 rounded-lg text-white"
            >
              <option value="America/Argentina/Buenos_Aires">
                Buenos Aires (GMT-3)
              </option>
              <option value="America/New_York">Nueva York (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Horarios de Trabajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hora de Apertura"
            type="time"
            value={companySettings.workingHours.start}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                workingHours: { ...prev.workingHours, start: e.target.value },
              }))
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Hora de Cierre"
            type="time"
            value={companySettings.workingHours.end}
            onChange={(e) =>
              setCompanySettings((prev) => ({
                ...prev,
                workingHours: { ...prev.workingHours, end: e.target.value },
              }))
            }
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </div>

      <Button
        onClick={() => handleSave("company")}
        isLoading={isLoading}
        leftIcon={<Save className="w-4 h-4" />}
        variant="primary"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Integraciones Disponibles
        </h3>
        <div className="space-y-4">
          {[
            {
              name: "Google Calendar",
              description: "Sincroniza eventos y citas con Google Calendar",
              connected: true,
              icon: Calendar,
            },
            {
              name: "WhatsApp Business",
              description: "Envía mensajes automáticos por WhatsApp",
              connected: false,
              icon: Smartphone,
            },
            {
              name: "Stripe",
              description: "Procesa pagos de forma segura",
              connected: true,
              icon: DollarSign,
            },
            {
              name: "Mailchimp",
              description: "Gestiona campañas de email marketing",
              connected: false,
              icon: Mail,
            },
          ].map((integration, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 glass rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <integration.icon className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-medium">{integration.name}</p>
                  <p className="text-white/60 text-sm">
                    {integration.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {integration.connected ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Conectado</span>
                  </div>
                ) : (
                  <span className="text-white/60 text-sm">Desconectado</span>
                )}
                <Button
                  variant={integration.connected ? "danger" : "primary"}
                  size="sm"
                >
                  {integration.connected ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="p-4 glass rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">API Key de Bukialo</p>
              <Button variant="glass" size="sm">
                Regenerar
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-black/30 rounded text-white/80 text-sm font-mono">
                bk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxx
              </code>
              <Button variant="glass" size="sm">
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Tema de la Aplicación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Oscuro", value: "dark", preview: "bg-gray-900" },
            { name: "Claro", value: "light", preview: "bg-white" },
            {
              name: "Automático",
              value: "auto",
              preview: "bg-gradient-to-r from-gray-900 to-white",
            },
          ].map((theme) => (
            <div
              key={theme.value}
              className="p-4 glass rounded-lg cursor-pointer hover:bg-white/20 transition-all border border-primary-500/50"
            >
              <div
                className={`w-full h-20 rounded-lg mb-3 ${theme.preview}`}
              ></div>
              <p className="text-white font-medium text-center">{theme.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Personalización</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass rounded-lg">
            <div>
              <p className="text-white font-medium">Animaciones</p>
              <p className="text-white/60 text-sm">
                Habilitar animaciones en la interfaz
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-lg">
            <div>
              <p className="text-white font-medium">Sonidos</p>
              <p className="text-white/60 text-sm">
                Reproducir sonidos de notificación
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={() => handleSave("appearance")}
        isLoading={isLoading}
        leftIcon={<Save className="w-4 h-4" />}
        variant="primary"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "notifications":
        return renderNotificationsTab();
      case "security":
        return renderSecurityTab();
      case "company":
        return renderCompanyTab();
      case "integrations":
        return renderIntegrationsTab();
      case "appearance":
        return renderAppearanceTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-white/60">
          Personaliza tu experiencia en Bukialo CRM
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="p-4 glass rounded-lg border border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="glass">
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                        activeTab === tab.id
                          ? "bg-primary-500/20 text-primary-300 border-r-2 border-primary-500"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tabs.find((tab) => tab.id === activeTab)?.icon &&
                  React.createElement(
                    tabs.find((tab) => tab.id === activeTab)!.icon,
                    {
                      className: "w-6 h-6",
                    }
                  )}
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
