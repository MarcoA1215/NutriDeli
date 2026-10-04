import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonToggle, IonBadge, useIonToast, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonNote, IonList
} from '@ionic/react';
import { apiClient } from '../../api/client';

interface Advance {
  id: string;
  amountUSD: number;
  amountBs?: number;
  reason: string;
  date: string;
}

interface UserTarget {
  id: string;
  username: string;
  role: string;
  salaryAmount?: number;
  salaryPeriod?: string;
}

interface Props {
  user: UserTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exchangeRate?: number;
}

export const PayrollPaymentModal: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  exchangeRate = 40.0,
}) => {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [discountAdvances, setDiscountAdvances] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentToast] = useIonToast();

  const baseSalary = user?.salaryAmount || 0;

  const fetchAdvances = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get<Advance[]>(`/salary-advances/pending/${user.id}`);
      setAdvances(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAdvances();
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setDiscountAdvances(true);
    }
  }, [isOpen, user]);

  const totalAdvances = advances.reduce((acc, a) => acc + a.amountUSD, 0);

  useEffect(() => {
    const net = discountAdvances ? Math.max(0, baseSalary - totalAdvances) : baseSalary;
    setAmountToPay(net);
  }, [baseSalary, totalAdvances, discountAdvances]);

  const equivalentBs = (amountToPay * exchangeRate).toFixed(2);

  const handleConfirmPay = async () => {
    if (!user) return;
    if (amountToPay < 0) {
      presentToast({ message: 'El monto a pagar no puede ser negativo', duration: 2500, color: 'warning' });
      return;
    }

    try {
      const advanceIds = discountAdvances ? advances.map(a => a.id) : [];
      await apiClient.post(`/users/${user.id}/pay-payroll`, {
        amountPaid: amountToPay,
        paymentMethod,
        discountAdvances,
        advanceIds,
        notes,
        date,
      });

      presentToast({
        message: `Nómina de ${user.username} pagada exitosamente ($${amountToPay.toFixed(2)})`,
        duration: 3000,
        color: 'success',
      });
      onSuccess();
      onClose();
    } catch (e) {
      presentToast({ message: 'Error al procesar pago de nómina', duration: 3000, color: 'danger' });
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>Pagar Nómina: {user?.username}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <IonCard style={{ margin: 0 }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Liquidación de Salario</span>
                  <IonBadge color="primary">{user.salaryPeriod || 'SEMANAL'}</IonBadge>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {/* Desglose de sueldo */}
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Sueldo Base Pactado:</span>
                    <strong>$ {baseSalary.toFixed(2)} USD</strong>
                  </div>

                  {advances.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d32f2f', marginBottom: '8px' }}>
                      <span>Vales / Anticipos Pendientes ({advances.length}):</span>
                      <strong>- $ {totalAdvances.toFixed(2)} USD</strong>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                    <span>Total Neto a Pagar:</span>
                    <strong style={{ color: '#2e7d32' }}>$ {amountToPay.toFixed(2)} USD</strong>
                  </div>
                </div>

                {/* Vales detectados */}
                {advances.length > 0 ? (
                  <div style={{ marginBottom: '15px', border: '1px solid #ffcc80', borderRadius: '8px', padding: '10px', background: '#fff8e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <IonLabel style={{ fontWeight: 'bold' }}>
                        Descontar vales pendientes (-${totalAdvances.toFixed(2)} USD)
                      </IonLabel>
                      <IonToggle
                        checked={discountAdvances}
                        onIonChange={e => setDiscountAdvances(e.detail.checked)}
                      />
                    </div>
                    <IonList style={{ background: 'transparent', marginTop: '8px' }}>
                      {advances.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', color: '#555' }}>
                          <span>• {a.date} - {a.reason}:</span>
                          <span style={{ fontWeight: 'bold' }}>${a.amountUSD.toFixed(2)}</span>
                        </div>
                      ))}
                    </IonList>
                  </div>
                ) : (
                  <IonNote color="medium" style={{ display: 'block', marginBottom: '15px', fontSize: '13px' }}>
                    ✓ El empleado no tiene vales ni anticipos pendientes de cobro.
                  </IonNote>
                )}

                {/* Ajuste manual si aplica */}
                <IonItem>
                  <IonLabel position="stacked">Monto Final a Desembolsar ($ USD)</IonLabel>
                  <IonInput
                    type="number"
                    step="any"
                    value={amountToPay}
                    onIonInput={e => setAmountToPay(parseFloat(e.detail.value!) || 0)}
                  />
                </IonItem>

                {/* Método de pago */}
                <IonItem>
                  <IonLabel position="stacked">Método de Pago</IonLabel>
                  <IonSelect value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
                    <IonSelectOption value="CASH">Efectivo ($ USD)</IonSelectOption>
                    <IonSelectOption value="TRANSFER">Pago Móvil / Transferencia (Bs. VES)</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {paymentMethod === 'TRANSFER' && (
                  <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#1565c0' }}>Equivalente a transferir en Bolívares:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0d47a1' }}>
                      Bs. {equivalentBs}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                      Calculado con la tasa de negocio: {exchangeRate} Bs/$
                    </div>
                  </div>
                )}

                <IonItem>
                  <IonLabel position="stacked">Fecha de Liquidación</IonLabel>
                  <IonInput type="date" value={date} onIonInput={e => setDate(e.detail.value!)} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Notas / Observaciones (Opcional)</IonLabel>
                  <IonInput
                    type="text"
                    value={notes}
                    onIonInput={e => setNotes(e.detail.value!)}
                    placeholder="Ej. Semana del 28 al 04, bono incluido"
                  />
                </IonItem>

                <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleConfirmPay}>
                  Confirmar y Registrar Pago de Nómina
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

