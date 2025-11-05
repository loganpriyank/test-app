import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroceryProducts } from './grocery-products/grocery-products';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GroceryProducts],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('test-app-temp');
}
