import React, { useState, useEffect } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonBadge, useIonToast, useIonAlert, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonGrid, IonRow, IonCol, IonNote
} from '@ionic/react';
import { apiClient } from '../../api/client';

export interface InvestmentItem {
  id: string;
  type: 'INVERSION_EXTERNA' | 'REINVERSION_GANANCIA';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const InvestmentModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [type, setType] = useState<'INVERSION_EXTERNA' | 'REINVERSION_GANANCIA'>('REINVERSION_GANANCIA');
  const [amount, setAmount] = useState<number | undefined>();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const fetchInvestments = async () => {
    try {
      const res = await apiClient.get<InvestmentItem[]>('/investments');
      setInvestments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvestments();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!amount || amount <= 0 || !description.trim()) {
      presentToast({ message: 'Ingresa un monto válido y una descripción', duration: 2500, color: 'warning' });
      return;
    }

    try {
      await apiClient.post('/investments', {
        type,
        amount,
        description,
        date,
      });
      presentToast({ message: 'Inversión registrada exitosamente', duration: 2000, color: 'success' });
      setAmount(undefined);
      setDescription('');
      fetchInvestments();
      onSaved();
    } catch (e) {
      presentToast({ message: 'Error al registrar inversión', duration: 3000, color: 'danger' });
    }
  };

  const handleDelete = (item: InvestmentItem) => {
    presentAlert({
      header: 'Eliminar Registro',
      message: `¿Estás seguro de eliminar este registro de $${item.amount.toFixed(2)}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await apiClient.delete(`/investments/${item.id}`);
              presentToast({ message: 'Registro eliminado', duration: 2000, color: 'success' });
              fetchInvestments();
              onSaved();
            } catch (e) {
              presentToast({ message: 'Error al eliminar', duration: 3000, color: 'danger' });
            }
          },
        },
      ],
    });
  };

  const totalExterna = investments
    .filter(i => i.type === 'INVERSION_EXTERNA')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalReinversion = investments
    .filter(i => i.type === 'REINVERSION_GANANCIA')
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonTitle>Inversión vs. Reinversión</IonTitle>
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
                  <IonCardTitle style={{ fontSize: '1.2rem' }}>Registrar Capital Inyectado</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Modalidad de Capital</IonLabel>
                    <IonSelect value={type} onIonChange={e => setType(e.detail.value)}>
                      <IonSelectOption value="REINVERSION_GANANCIA">
                        Reinversión de Ganancia (De ventas)
                      </IonSelectOption>
                      <IonSelectOption value="INVERSION_EXTERNA">
                        Inversión Externa (Capital socios, préstamos)
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonNote color="medium" style={{ display: 'block', margin: '8px 16px', fontSize: '12px' }}>
                    {type === 'REINVERSION_GANANCIA'
                      ? 'Dinero generado por las ventas que decides no retirar, sino reinvertir en mejoras del negocio.'
                      : 'Capital que no proviene de la operación corriente (ahorros personales, socios, préstamos) para equipamiento o reformas.'}
                  </IonNote>

                  <IonItem>
                    <IonLabel position="stacked">Monto en USD ($)</IonLabel>
                    <IonInput
                      type="number"
                      step="any"
                      value={amount}
                      onIonInput={e => setAmount(parseFloat(e.detail.value!) || undefined)}
                      placeholder="Ej. 150.00"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Descripción / Destino</IonLabel>
                    <IonInput
                      type="text"
                      value={description}
                      onIonInput={e => setDescription(e.detail.value!)}
                      placeholder="Ej. Compra de freidora industrial, pintura de local"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Fecha</IonLabel>
                    <IonInput
                      type="date"
                      value={date}
                      onIonInput={e => setDate(e.detail.value!)}
                    />
                  </IonItem>

                  <IonButton expand="block" color="tertiary" className="ion-margin-top" onClick={handleCreate}>
                    Guardar Registro
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Historial y balances */}
            <IonCol size="12" sizeMd="7">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1, background: '#e8f5e9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>REINVERSIÓN DE GANANCIA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1b5e20' }}>
                    $ {totalReinversion.toFixed(2)}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#e3f2fd', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: 'bold' }}>INVERSIÓN EXTERNA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0d47a1' }}>
                    $ {totalExterna.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="table-responsive" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Modalidad</th>
                      <th>Monto</th>
                      <th>Descripción</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>
                          <IonBadge color={item.type === 'REINVERSION_GANANCIA' ? 'success' : 'primary'}>
                            {item.type === 'REINVERSION_GANANCIA' ? 'Reinversión' : 'Externa'}
                          </IonBadge>
                        </td>
                        <td><strong>$ {item.amount.toFixed(2)}</strong></td>
                        <td>{item.description}</td>
                        <td>
                          <IonButton fill="clear" color="danger" size="small" onClick={() => handleDelete(item)}>
                            Eliminar
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                    {investments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="ion-text-center" style={{ padding: '20px', color: '#888' }}>
                          No hay inversiones ni reinversiones registradas aún.
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

