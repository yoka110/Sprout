import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { PlantList } from './plant-list/plant-list';
import { PlantDetail } from './plant-detail/plant-detail';
import { PlantForm } from './plant-form/plant-form';
import { BedList } from './bed-list/bed-list';
import { BedDetail } from './bed-detail/bed-detail';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  // start page
  { path: '', component: Home },

  // user accounts (AP-A)
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // plants (AP-B)
  { path: 'plants', component: PlantList },
  // 'new' must come before ':id', otherwise ':id' would match 'new'
  { path: 'plants/new', component: PlantForm },
  { path: 'plants/:id', component: PlantDetail },

  // beds (AP-C)
  { path: 'beds', component: BedList },
  { path: 'beds/:id', component: BedDetail },

  // any unknown path
  { path: '**', component: NotFound },
];
