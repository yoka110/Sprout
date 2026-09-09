import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

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
  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'plants', component: PlantList },
  // 'new' must come before ':id', otherwise ':id' would match 'new'
  { path: 'plants/new', component: PlantForm, canActivate: [authGuard] },
  { path: 'plants/:id', component: PlantDetail },

  { path: 'beds', component: BedList, canActivate: [authGuard] },
  { path: 'beds/:id', component: BedDetail, canActivate: [authGuard] },

  { path: '**', component: NotFound },
];
