const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

file = file.replace(
  "import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonButton, IonList, IonLabel, IonBadge, useIonToast, useIonAlert, IonText, IonSegment, IonSegmentButton, IonSearchbar, IonIcon } from '@ionic/react';",
  "import { IonSelect, IonSelectOption, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonButton, IonList, IonLabel, IonBadge, useIonToast, useIonAlert, IonText, IonSegment, IonSegmentButton, IonSearchbar, IonIcon } from '@ionic/react';"
);

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Added IonSelect and IonSelectOption to imports");
