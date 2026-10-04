import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  useIonToast, useIonAlert, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonGrid, IonRow, IonCol, IonNote
} from '@ionic/react';
import { apiClient } from '../../api/client';

export interface AdvanceItem {
  id: string;
  userId: string;
  user?: { id: string; username: string };
  amountUSD: number;
  amountBs?: number;
  exchangeRate?: number;
  reason: string;
  status: 'PENDIENTE' | 'DESCONTADO';
  date: string;
  createdAt: string;
}

interface UserOption {
  id: string;
  username: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  exchangeRate?: number;
  defaultUserId?: string;
}

export const SalaryAdvanceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  exchangeRate = 40.0,
  defaultUserId,
}) => {
  const [employees, setEmployees] = useState<UserOption[]>([]);
  const [advances, setAdvances] = useState<AdvanceItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(defaultUserId || '');
  const [amountUSD, setAmountUSD] = useState<number | undefined>();
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get<UserOption[]>('/users/simple');
      setEmployees(res.data);
      if (!selectedUserId && res.data.length > 0) {
        setSelectedUserId(defaultUserId || res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdvances = async () => {
    try {
      const res = await apiClient.get<AdvanceItem[]>('/salary-advances?status=PENDIENTE');
      setAdvances(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchAdvances();
      if (defaultUserId) setSelectedUserId(defaultUserId);
    }
  }, [isOpen, defaultUserId]);

  const calculatedBs = amountUSD ? (amountUSD * exchangeRate).toFixed(2) : '0.00';

  const handleCreate = async () => {
    if (!selectedUserId) {
      presentToast({ message: 'Selecciona un empleado', duration: 2500, color: 'warning' });
      return;
    }
    if (!amountUSD || amountUSD <= 0) {
      presentToast({ message: 'Ingresa un monto válido en USD', duration: 2500, color: 'warning' });
      return;
    }
    if (!reason.trim()) {
      presentToast({ message: 'Indica el motivo del adelanto', duration: 2500, color: 'warning' });
      return;
    }

    try {
      await apiClient.post('/salary-advances', {
        userId: selectedUserId,
        amountUSD,
        amountBs: parseFloat(calculatedBs),
        exchangeRate,
        reason,
        date,
      });

      presentToast({
        message: 'Vale registrado exitosamente y descontado de la gaveta de efectivo',
        duration: 3000,
        color: 'success',
      });

      setAmountUSD(undefined);
      setReason('');
      fetchAdvances();
      onSaved();
    } catch (e) {
      presentToast({ message: 'Error al registrar vale', duration: 3000, color: 'danger' });
    }
  };

  const handleCancelAdvance = (item: AdvanceItem) => {
    presentAlert({
      header: 'Cancelar Vale',
      message: `¿Estás seguro de cancelar este vale de $${item.amountUSD.toFixed(2)} a ${item.user?.username || 'empleado'}? Se devolverá el egreso a la caja.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Confirmar Cancelación',
          role: 'destructive',
          handler: async () => {
            try {
              await apiClient.delete(`/salary-advances/${item.id}`);
              presentToast({ message: 'Vale cancelado y revertido de caja', duration: 2000, color: 'success' });
              fetchAdvances();
              onSaved();
            } catch (e: any) {
              presentToast({ message: 'Error al cancelar vale', duration: 3000, color: 'danger' });
            }
          },
        },
      ],
    });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle>Vales y Anticipos de Empleados</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {/* Formulario de registro */}
            <IonCol size="12" sizeMd="5">
              <IonCard style={{ margin: 0 }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.2rem' }}>Entregar Adelanto de Caja</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Empleado</IonLabel>
                    <IonSelect
                      value={selectedUserId}
                      onIonChange={e => setSelectedUserId(e.detail.value)}
                      placeholder="Selecciona empleado"
                    >
                      {employees.map(emp => (
                        <IonSelectOption key={emp.id} value={emp.id}>
                          {emp.username} ({emp.role})
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Monto en Dólares ($ USD)</IonLabel>
                    <IonInput
                      type="number"
                      step="any"
                      value={amountUSD}
                      onIonInput={e => setAmountUSD(parseFloat(e.detail.value!) || undefined)}
                      placeholder="Ej. 15.00"
                    />
                  </IonItem>

                  {amountUSD && amountUSD > 0 && (
                    <IonNote color="primary" style={{ display: 'block', margin: '8px 16px', fontSize: '13px' }}>
                      Equivalente en Bolívares: <strong>Bs. {calculatedBs}</strong> (Tasa: {exchangeRate} Bs/$)
                    </IonNote>
                  )}

                  <IonItem>
                    <IonLabel position="stacked">Motivo / Razón</IonLabel>
                    <IonInput
                      type="text"
                      value={reason}
                      onIonInput={e => setReason(e.detail.value!)}
                      placeholder="Ej. Adelanto médico, pasajes, emergencia"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Fecha de Entrega</IonLabel>
                    <IonInput
                      type="date"
                      value={date}
                      onIonInput={e => setDate(e.detail.value!)}
                    />
                  </IonItem>

                  <IonNote color="medium" style={{ display: 'block', margin: '12px 16px', fontSize: '12px' }}>
                    ⚠️ Este vale se registrará como egreso operativo en <strong>Efectivo (CASH)</strong> de la caja hoy y quedará pendiente para descontarse automáticamente en el pago de nómina.
                  </IonNote>

                  <IonButton expand="block" color="warning" className="ion-margin-top" onClick={handleCreate}>
                    Registrar y Retirar de Caja
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Listado de vales pendientes */}
            <IonCol size="12" sizeMd="7">
              <h4 style={{ marginTop: 0 }}>Vales Pendientes por Cobrar / Descontar</h4>
              <div className="table-responsive" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Empleado</th>
                      <th>Monto ($)</th>
                      <th>Monto (Bs)</th>
                      <th>Motivo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td><strong>{item.user?.username || 'Empleado'}</strong></td>
                        <td style={{ color: '#d32f2f', fontWeight: 'bold' }}>- $ {item.amountUSD.toFixed(2)}</td>
                        <td>Bs. {item.amountBs ? item.amountBs.toFixed(2) : '-'}</td>
                        <td>{item.reason}</td>
                        <td>
                          <IonButton fill="clear" color="danger" size="small" onClick={() => handleCancelAdvance(item)}>
                            Cancelar
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                    {advances.length === 0 && (
                      <tr>
                        <td colSpan={6} className="ion-text-center" style={{ padding: '20px', color: '#888' }}>
                          No hay vales pendientes de cobro en este momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

