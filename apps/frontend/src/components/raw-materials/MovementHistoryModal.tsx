import React, { useEffect, useState } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonBadge, useIonAlert, useIonToast, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonNote
} from '@ionic/react';
import { apiClient } from '../../api/client';
import type { RawMaterial, Movement } from '../../types';

const movementTypeTranslations: Record<string, string> = {
  IN_PURCHASE: 'Compra',
  IN_PRODUCTION: 'Entrada (Producción)',
  OUT_PRODUCTION: 'Salida (Producción)',
  OUT_SALE: 'Venta',
  LOSS: 'Pérdida / Ajuste',
  IN_INITIAL: 'Inv. Inicial',
  IN_RESTOCK: 'Compra',
  IN: 'Entrada',
  OUT: 'Salida'
};

interface MovementHistoryModalProps {
  material: RawMaterial | null;
  onClose: () => void;
  onCorrected: () => void;
  exchangeRate?: number;
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({ material, onClose, onCorrected, exchangeRate = 36.5 }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [editQty, setEditQty] = useState<number | undefined>();
  const [editCost, setEditCost] = useState<number | undefined>();
  const [editCurrency, setEditCurrency] = useState<'USD' | 'VES'>('USD');

  useEffect(() => {
    if (material) fetchMovements(material.id);
    else setMovements([]);
  }, [material]);

  const fetchMovements = async (id: string) => {
    try {
      const res = await apiClient.get<Movement[]>('/raw-materials/' + id + '/movements');
      setMovements(res.data);
    } catch (e) {
      console.error(e);
      presentToast({ message: 'Error al cargar historial', duration: 3000, color: 'danger' });
    }
  };

  const openEditLossAlert = (mov: Movement) => {
    if (!material) return;
    presentAlert({
      header: 'Corregir Pérdida',
      inputs: [{ name: 'qty', type: 'number', value: mov.quantity, placeholder: 'Cantidad correcta' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.qty) return false;
            try {
              await apiClient.put('/stock-movements/' + mov.id, {
                quantity: parseFloat(data.qty),
                totalCost: 0
              });
              fetchMovements(material.id);
              onCorrected(); 
              presentToast({ message: 'Pérdida corregida', duration: 2000, color: 'success' });
            } catch (e) {
              presentToast({ message: 'Error al corregir', duration: 3000, color: 'danger' });
            }
          }
        }
      ]
    });
  };

  const handleEditClick = (mov: Movement) => {
    if (mov.type === 'LOSS') {
      openEditLossAlert(mov);
    } else {
      setEditingMovement(mov);
      setEditQty(mov.quantity);
      setEditCost(mov.totalCost);
      setEditCurrency('USD');
    }
  };

  const handleSaveCorrection = async () => {
    if (!editingMovement || !material || !editQty) return;
    let finalCostUSD = editCost || 0;
    if (editCurrency === 'VES') {
      const rate = exchangeRate && exchangeRate > 0 ? exchangeRate : 1;
      finalCostUSD = (editCost || 0) / rate;
    }

    try {
      await apiClient.put('/stock-movements/' + editingMovement.id, {
        quantity: editQty,
        totalCost: finalCostUSD
      });
      setEditingMovement(null);
      fetchMovements(material.id);
      onCorrected(); 
      presentToast({ message: 'Compra corregida exitosamente', duration: 2000, color: 'success' });
    } catch (e) {
      presentToast({ message: 'Error al corregir compra', duration: 3000, color: 'danger' });
    }
  };

  return (
    <IonModal isOpen={!!material} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Historial: {material?.name}</IonTitle>
          <IonButtons slot="end"><IonButton onClick={onClose}>Cerrar</IonButton></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="table-responsive">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Costo</th><th>Notas</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {movements.map(mov => (
                <tr key={mov.id}>
                  <td>{new Date(mov.createdAt).toLocaleString()}</td>
                  <td>
                    <IonBadge color={mov.type.startsWith('IN') ? 'success' : 'danger'} style={{ padding: '6px', fontSize: '0.85rem' }}>
                      {movementTypeTranslations[mov.type] || mov.type}
                    </IonBadge>
                  </td>
                  <td>{mov.quantity}</td>
                  <td>$ {(mov.totalCost || 0).toFixed(2)}</td>
                  <td>{mov.description}</td>
                  <td>
                    {(mov.type === 'IN_PURCHASE' || mov.type === 'LOSS') && (
                      <IonButton fill="clear" color="primary" size="small" onClick={() => handleEditClick(mov)}>Corregir</IonButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para corregir compras con selector de moneda USD / VES */}
        <IonModal isOpen={!!editingMovement} onDidDismiss={() => setEditingMovement(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Corregir Compra</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditingMovement(null)}>Cancelar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {editingMovement && (
              <>
                <h4 style={{ marginTop: 0 }}>{material?.name}</h4>
                <IonItem>
                  <IonLabel position="stacked">Cantidad ({material?.unit})</IonLabel>
                  <IonInput 
                    type="number" step="any"
                    value={editQty}
                    onIonInput={e => setEditQty(parseFloat(e.detail.value!) || undefined)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Costo Total</span>
                    <IonSelect value={editCurrency} onIonChange={e => setEditCurrency(e.detail.value)} style={{ minHeight: 'auto', padding: '0', background: '#eee', borderRadius: '4px', paddingLeft: '5px', paddingRight: '5px' }}>
                      <IonSelectOption value="USD">$ USD</IonSelectOption>
                      <IonSelectOption value="VES">Bs. VES</IonSelectOption>
                    </IonSelect>
                  </IonLabel>
                  <IonInput 
                    type="number" step="any"
                    value={editCost}
                    onIonInput={e => setEditCost(parseFloat(e.detail.value!) || undefined)}
                    placeholder="0.00"
                  />
                </IonItem>
                {editCurrency === 'VES' && editCost && (
                  <IonNote color="primary" className="ion-margin-top ion-padding-horizontal" style={{ display: 'block', fontSize: '13px' }}>
                    Equivalente a registrar: $ {(editCost / (exchangeRate || 1)).toFixed(2)} USD (Tasa: {exchangeRate} Bs/$)
                  </IonNote>
                )}
                <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleSaveCorrection}>
                  Guardar Corrección
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonModal>
  );
};
