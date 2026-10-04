import React, { useState, useEffect, useContext } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput,
  IonButton, IonButtons, IonMenuButton, useIonToast, IonIcon, IonSelect,
  IonSelectOption, IonBadge, IonModal
} from '@ionic/react';
import { refreshOutline, cashOutline, walletOutline, createOutline } from 'ionicons/icons';
import { apiClient } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '@nutrideli/shared-types';
import { SalaryAdvanceModal } from '../components/salary-advances/SalaryAdvanceModal';
import { PayrollPaymentModal } from '../components/payroll/PayrollPaymentModal';

interface UserData {
  id: string;
  username: string;
  role: string;
  salaryAmount?: number;
  salaryPeriod?: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.POS);
  const [salaryAmount, setSalaryAmount] = useState<number | undefined>();
  const [salaryPeriod, setSalaryPeriod] = useState<string>('SEMANAL');
  const [exchangeRate, setExchangeRate] = useState<number>(40.0);

  // Modals state
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [payrollTargetUser, setPayrollTargetUser] = useState<UserData | null>(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  // Edit Salary Modal
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editSalaryAmount, setEditSalaryAmount] = useState<number | undefined>();
  const [editSalaryPeriod, setEditSalaryPeriod] = useState<string>('SEMANAL');

  const [presentToast] = useIonToast();
  const { user } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<UserData[]>('/users');
      setUsers(res.data);
    } catch (e) {
      presentToast({ message: 'Error cargando usuarios', duration: 3000, color: 'danger' });
    }
  };

  const fetchRate = async () => {
    try {
      const res = await apiClient.get<any>('/settings');
      setExchangeRate(res.data.exchangeRateBs || 40.0);
    } catch (e) {}
  };

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      fetchUsers();
      fetchRate();
    }
  }, [user]);

  const handleCreate = async () => {
    if (!username || !password) {
      return presentToast({ message: 'Usuario y contraseña son requeridos', duration: 3000, color: 'warning' });
    }
    try {
      await apiClient.post('/users', {
        username,
        password,
        role,
        salaryAmount: salaryAmount ? Number(salaryAmount) : 0,
        salaryPeriod,
      });
      presentToast({ message: 'Usuario creado exitosamente', duration: 2000, color: 'success' });
      setUsername('');
      setPassword('');
      setSalaryAmount(undefined);
      setSalaryPeriod('SEMANAL');
      fetchUsers();
    } catch (e: any) {
      presentToast({ message: 'Error al crear usuario', duration: 4000, color: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`);
      presentToast({ message: 'Usuario eliminado', duration: 2000, color: 'success' });
      fetchUsers();
    } catch (e) {
      presentToast({ message: 'Error al eliminar', duration: 3000, color: 'danger' });
    }
  };

  const openEditSalary = (u: UserData) => {
    setEditingUser(u);
    setEditSalaryAmount(u.salaryAmount || 0);
    setEditSalaryPeriod(u.salaryPeriod || 'SEMANAL');
  };

  const handleSaveSalary = async () => {
    if (!editingUser) return;
    try {
      await apiClient.put(`/users/${editingUser.id}`, {
        salaryAmount: editSalaryAmount !== undefined ? Number(editSalaryAmount) : 0,
        salaryPeriod: editSalaryPeriod,
      });
      presentToast({ message: 'Sueldo actualizado exitosamente', duration: 2500, color: 'success' });
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      presentToast({ message: 'Error al actualizar sueldo', duration: 3000, color: 'danger' });
    }
  };

  const handleOpenPayroll = (targetUser: UserData) => {
    setPayrollTargetUser(targetUser);
    setShowPayrollModal(true);
  };

  if (user?.role !== UserRole.ADMIN) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="danger">
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>Acceso Denegado</IonTitle>
            <IonButtons slot="end"><IonButton onClick={fetchUsers}><IonIcon icon={refreshOutline} /></IonButton></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <h2>No tienes permiso para ver esta pantalla.</h2>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Personal y Nómina</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowAdvanceModal(true)}>
              <IonIcon icon={walletOutline} slot="start" />
              Registrar Vale
            </IonButton>
            <IonButton onClick={fetchUsers}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {/* Formulario de Crear Usuario */}
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Registrar Nuevo Empleado / Usuario</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Nombre de Usuario</IonLabel>
                    <IonInput value={username} onIonInput={e => setUsername(e.detail.value!)} placeholder="Ej. juan_cajero" />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Contraseña</IonLabel>
                    <IonInput type="password" value={password} onIonInput={e => setPassword(e.detail.value!)} placeholder="***" />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Rol / Permiso</IonLabel>
                    <IonSelect value={role} onIonChange={e => setRole(e.detail.value)}>
                      <IonSelectOption value={UserRole.ADMIN}>Administrador</IonSelectOption>
                      <IonSelectOption value={UserRole.POS}>Cajero (POS)</IonSelectOption>
                      <IonSelectOption value={UserRole.KITCHEN}>Cocina (KITCHEN)</IonSelectOption>
                      <IonSelectOption value={UserRole.DELIVERY}>Repartidor (DELIVERY)</IonSelectOption>
                      <IonSelectOption value={UserRole.INVENTORY}>Reabastecedor (INVENTORY)</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Sueldo Base ($ USD)</IonLabel>
                    <IonInput
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={salaryAmount}
                      onIonInput={e => setSalaryAmount(parseFloat(e.detail.value!) || undefined)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Frecuencia de Pago</IonLabel>
                    <IonSelect value={salaryPeriod} onIonChange={e => setSalaryPeriod(e.detail.value)}>
                      <IonSelectOption value="SEMANAL">Semanal</IonSelectOption>
                      <IonSelectOption value="QUINCENAL">Quincenal</IonSelectOption>
                      <IonSelectOption value="MENSUAL">Mensual</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonButton expand="block" color="primary" className="ion-margin-top" onClick={handleCreate}>
                    Crear Empleado
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Listado de Usuarios con Sueldo y Nómina */}
            <IonCol size="12" sizeMd="8">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Listado de Personal y Salarios</IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Usuario</th>
                          <th style={{ padding: '8px' }}>Rol</th>
                          <th style={{ padding: '8px' }}>Sueldo Pactado</th>
                          <th style={{ padding: '8px' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>
                              <strong>{u.username}</strong>
                            </td>
                            <td style={{ padding: '8px' }}>
                              <IonBadge color={u.role === UserRole.ADMIN ? 'danger' : 'primary'}>{u.role}</IonBadge>
                            </td>
                            <td style={{ padding: '8px' }}>
                              {u.salaryAmount ? (
                                <div>
                                  <strong style={{ color: '#2dd36f' }}>${Number(u.salaryAmount).toFixed(2)} USD</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>{u.salaryPeriod || 'SEMANAL'}</small>
                                </div>
                              ) : (
                                <span style={{ color: '#999' }}>Sin sueldo asignado</span>
                              )}
                            </td>
                            <td style={{ padding: '8px' }}>
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <IonButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenPayroll(u)}
                                >
                                  <IonIcon icon={cashOutline} slot="start" />
                                  Pagar Nómina
                                </IonButton>

                                <IonButton
                                  size="small"
                                  fill="outline"
                                  color="secondary"
                                  onClick={() => openEditSalary(u)}
                                >
                                  <IonIcon icon={createOutline} slot="start" />
                                  Sueldo
                                </IonButton>

                                {u.username !== 'admin' && (
                                  <IonButton
                                    size="small"
                                    color="danger"
                                    fill="clear"
                                    onClick={() => handleDelete(u.id)}
                                  >
                                    Eliminar
                                  </IonButton>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={4} className="ion-text-center" style={{ padding: '16px' }}>Cargando...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal para Editar Sueldo */}
        <IonModal isOpen={!!editingUser} onDidDismiss={() => setEditingUser(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Configurar Sueldo: {editingUser?.username}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditingUser(null)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Monto de Sueldo ($ USD)</IonLabel>
              <IonInput
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editSalaryAmount}
                onIonInput={e => setEditSalaryAmount(parseFloat(e.detail.value!) || undefined)}
              />
            </IonItem>
            {editSalaryAmount && (
              <p style={{ margin: '6px 16px', color: '#666', fontSize: '0.85rem' }}>
                Equivalente al cambio: Bs. {(editSalaryAmount * exchangeRate).toFixed(2)}
              </p>
            )}

            <IonItem className="ion-margin-top">
              <IonLabel position="stacked">Frecuencia de Pago</IonLabel>
              <IonSelect
                value={editSalaryPeriod}
                onIonChange={e => setEditSalaryPeriod(e.detail.value)}
              >
                <IonSelectOption value="SEMANAL">Semanal</IonSelectOption>
                <IonSelectOption value="QUINCENAL">Quincenal</IonSelectOption>
                <IonSelectOption value="MENSUAL">Mensual</IonSelectOption>
              </IonSelect>
            </IonItem>

            <div style={{ marginTop: '24px' }}>
              <IonButton expand="block" color="primary" onClick={handleSaveSalary}>
                Guardar Configuración
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal de Pago de Nómina */}
        <PayrollPaymentModal
          user={payrollTargetUser}
          isOpen={showPayrollModal}
          onClose={() => {
            setShowPayrollModal(false);
            setPayrollTargetUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
          }}
          exchangeRate={exchangeRate}
        />

        {/* Modal de Solicitud de Vales */}
        <SalaryAdvanceModal
          isOpen={showAdvanceModal}
          onClose={() => setShowAdvanceModal(false)}
          onSaved={() => {
            fetchUsers();
          }}
          exchangeRate={exchangeRate}
        />
      </IonContent>
    </IonPage>
  );
};

export default Users;
