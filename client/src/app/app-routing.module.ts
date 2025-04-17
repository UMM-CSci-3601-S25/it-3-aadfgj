import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './landing-page/landing-page';
import { SettingsPageComponent } from './settings-page/settings-page';
import { GameComponent } from './game-page/game-page';

const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Generic Apples Game'},
  {path: 'settings/:id', component: SettingsPageComponent, title: 'Settings'},
  {path: 'game/:id', component: GameComponent, title: 'Game'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
