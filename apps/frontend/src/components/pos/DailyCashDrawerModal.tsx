import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonBadge, useIonToast,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol,
  IonText, IonList, IonIcon
} from '@ionic/react';
import { cashOutline, cardOutline, removeCircleOutline, addCircleOutline, refreshOutline } from 'ionicons/icons';
import { apiClient } from '../../api/client';

interface CashExpenseItem {
  id: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  referenceId?: string;
  date: string;
  createdAt: string;
}

interface CashDrawerData {
  date: string;
  totalCashSales: number;
  totalElectronicSales: number;
  totalCashExpenses: number;
  cashExpensesList: CashExpenseItem[];
  netCashInDrawer: number;
  calculatedNetDrawer: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate?: number;
}

export const DailyCashDrawerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exchangeRate = 40.0,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drawerData, setDrawerData] = useState<CashDrawerData | null>(null);
  // Quick expense form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number | undefined>();
  const [expenseDescription, setExpenseDescription] = useState('');

  const [presentToast] = useIonToast();

  const fetchDrawerData = async () => {
    try {
      const res = await apiClient.get<CashDrawerData>(`/operating-expenses/cash-drawer-summary?date=${selectedDate}`);
      setDrawerData(res.data);
    } catch (e) {
      console.error(e);
      presentToast({ message: 'Error cargando datos de caja', duration: 2500, color: 'danger' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDrawerData();
    }
  }, [isOpen, selectedDate]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || expenseAmount <= 0) {
      return presentToast({ message: 'Ingresa un monto válido', duration: 2500, color: 'warning' });
    }

    try {
      await apiClient.post('/operating-expenses', {
        category: 'GENERAL',
        amount: Number(expenseAmount),
        paymentMethod: 'CASH',
        description: expenseDescription.trim() || 'Gasto menor de caja',
        date: selectedDate,
      });

      presentToast({ message: 'Salida de efectivo registrada', duration: 2500, color: 'success' });
      setExpenseAmount(undefined);
      setExpenseDescription('');
      setShowAddExpense(false);
      fetchDrawerData();
    } catch (err: any) {
      console.error(err);
      presentToast({ message: 'Error al registrar salida de efectivo', duration: 3000, color: 'danger' });
    }
  };

  const netDrawer = drawerData?.calculatedNetDrawer ?? 0;
  const netDrawerBs = netDrawer * exchangeRate;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>Arqueo de Gaveta / Cierre de Efectivo</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={fetchDrawerData}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem className="ion-margin-bottom">
          <IonLabel position="stacked">Fecha de Arqueo</IonLabel>
          <IonInput
            type="date"
            value={selectedDate}
            onIonInput={e => setSelectedDate(e.detail.value!)}
          />
        </IonItem>

        {/* Resumen de Gaveta */}
        <IonGrid>
          <IonRow>
            {/* Efectivo neto en gaveta */}
            <IonCol size="12">
              <IonCard color="primary" style={{ margin: 0, textAlign: 'center' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem' }}>Efectivo Neto Esperado en Gaveta</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h1 style={{ fontSize: '2.4rem', fontWeight: 'bold', margin: '5px 0' }}>
                    ${netDrawer.toFixed(2)} USD
                  </h1>
                  <h3 style={{ margin: 0, opacity: 0.9 }}>
                    ≈ Bs. {netDrawerBs.toFixed(2)} (Tasa: {exchangeRate.toFixed(2)})
                  </h3>
                  <p style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                    Fórmula: Ventas Efectivo - Vales/Egresos de Caja
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Ventas en Efectivo */}
            <IonCol size="12" sizeMd="4">
              <IonCard style={{ margin: '10px 0 0 0', background: '#d1e7dd', color: '#0f5132' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={cashOutline} style={{ fontSize: '1.4rem' }} />
                    <IonCardTitle style={{ fontSize: '1rem', color: '#0f5132' }}>Ventas Efectivo</IonCardTitle>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ fontWeight: 'bold', margin: 0 }}>
                    ${(drawerData?.totalCashSales ?? 0).toFixed(2)} USD
                  </h2>
                  <small>Bs. {((drawerData?.totalCashSales ?? 0) * exchangeRate).toFixed(2)}</small>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Egresos y Vales de Efectivo */}
            <IonCol size="12" sizeMd="4">
              <IonCard style={{ margin: '10px 0 0 0', background: '#f8d7da', color: '#842029' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={removeCircleOutline} style={{ fontSize: '1.4rem' }} />
                    <IonCardTitle style={{ fontSize: '1rem', color: '#842029' }}>Egresos / Vales</IonCardTitle>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ fontWeight: 'bold', margin: 0 }}>
                    -${(drawerData?.totalCashExpenses ?? 0).toFixed(2)} USD
                  </h2>
                  <small>Bs. {((drawerData?.totalCashExpenses ?? 0) * exchangeRate).toFixed(2)}</small>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Ventas Electrónicas / Pago Móvil */}
            <IonCol size="12" sizeMd="4">
              <IonCard style={{ margin: '10px 0 0 0', background: '#cfe2ff', color: '#084298' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={cardOutline} style={{ fontSize: '1.4rem' }} />
                    <IonCardTitle style={{ fontSize: '1rem', color: '#084298' }}>Pago Móvil / Banco</IonCardTitle>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ fontWeight: 'bold', margin: 0 }}>
                    ${(drawerData?.totalElectronicSales ?? 0).toFixed(2)} USD
                  </h2>
                  <small>Bs. {((drawerData?.totalElectronicSales ?? 0) * exchangeRate).toFixed(2)}</small>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Botón para registrar salida rápida de efectivo */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Detalle de Egresos y Vales del Día</h4>
          <IonButton
            size="small"
            fill="outline"
            color="danger"
            onClick={() => setShowAddExpense(!showAddExpense)}
          >
            <IonIcon icon={addCircleOutline} slot="start" />
            {showAddExpense ? 'Cancelar' : 'Registrar Salida de Caja'}
          </IonButton>
        </div>

        {showAddExpense && (
          <IonCard style={{ margin: '10px 0', border: '1px solid #dc3545' }}>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1rem', color: '#dc3545' }}>
                Registrar Salida / Gasto Menor de Caja
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleCreateExpense}>
                <IonItem>
                  <IonLabel position="stacked">Monto en Efectivo ($ USD)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onIonInput={e => setExpenseAmount(parseFloat(e.detail.value!) || undefined)}
                    required
                  />
                </IonItem>
                {expenseAmount && (
                  <p style={{ margin: '4px 16px', color: '#666', fontSize: '0.85rem' }}>
                    Equivalente: Bs. {(expenseAmount * exchangeRate).toFixed(2)}
                  </p>
                )}

                <IonItem>
                  <IonLabel position="stacked">Motivo / Descripción</IonLabel>
                  <IonInput
                    type="text"
                    placeholder="Ej. Compra de hielo, bolsas, etc."
                    value={expenseDescription}
                    onIonInput={e => setExpenseDescription(e.detail.value!)}
                  />
                </IonItem>

                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <IonButton color="danger" type="submit">
                    Guardar Salida
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        )}

        {/* Lista de egresos de caja */}
        <IonCard style={{ margin: '15px 0' }}>
          <IonCardContent>
            {(!drawerData?.cashExpensesList || drawerData.cashExpensesList.length === 0) ? (
              <p style={{ textAlign: 'center', color: '#888', margin: '15px 0' }}>
                No hay egresos ni vales en efectivo registrados para esta fecha.
              </p>
            ) : (
              <IonList>
                {drawerData.cashExpensesList.map(item => (
                  <IonItem key={item.id}>
                    <IonLabel>
                      <h3>
                        <IonBadge color={item.category === 'VALE_EMPLEADO' ? 'warning' : 'danger'}>
                          {item.category === 'VALE_EMPLEADO' ? 'VALE DE EMPLEADO' : 'GASTO OPERATIVO'}
                        </IonBadge>
                      </h3>
                      <p style={{ marginTop: '4px' }}>{item.description || 'Sin descripción'}</p>
                      <small style={{ color: '#888' }}>
                        Fecha: {item.date} | {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'right' }}>
                      <IonText color="danger">
                        <h3 style={{ margin: 0, fontWeight: 'bold' }}>-${Number(item.amount).toFixed(2)} USD</h3>
                      </IonText>
                      <small style={{ color: '#666' }}>
                        Bs. {(Number(item.amount) * exchangeRate).toFixed(2)}
                      </small>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>
  );
};
