import { Component, signal, computed, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface GroceryProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-grocery-products',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  templateUrl: './grocery-products.html',
  styleUrl: './grocery-products.css',
})
export class GroceryProducts {
  private dialog = inject(MatDialog);
  displayedColumns: string[] = ['name', 'category', 'price', 'quantity', 'actions'];

  products = signal<GroceryProduct[]>([
    { id: 1, name: 'Apples', category: 'Fruits', price: 3.99, quantity: 50 },
    { id: 2, name: 'Bananas', category: 'Fruits', price: 2.49, quantity: 75 },
    { id: 3, name: 'Milk', category: 'Dairy', price: 4.99, quantity: 30 },
    { id: 4, name: 'Bread', category: 'Bakery', price: 2.99, quantity: 40 },
    { id: 5, name: 'Cheese', category: 'Dairy', price: 6.99, quantity: 25 },
    { id: 6, name: 'Chicken', category: 'Meat', price: 8.99, quantity: 20 },
    { id: 7, name: 'Rice', category: 'Grains', price: 5.49, quantity: 60 },
    { id: 8, name: 'Pasta', category: 'Grains', price: 3.49, quantity: 45 },
    { id: 9, name: 'Tomatoes', category: 'Vegetables', price: 4.49, quantity: 35 },
    { id: 10, name: 'Carrots', category: 'Vegetables', price: 2.99, quantity: 55 },
    { id: 11, name: 'Oranges', category: 'Fruits', price: 4.49, quantity: 40 },
    { id: 12, name: 'Yogurt', category: 'Dairy', price: 3.99, quantity: 35 },
    { id: 13, name: 'Eggs', category: 'Dairy', price: 5.99, quantity: 100 },
    { id: 14, name: 'Butter', category: 'Dairy', price: 4.49, quantity: 30 },
    { id: 15, name: 'Salmon', category: 'Seafood', price: 12.99, quantity: 15 },
    { id: 16, name: 'Shrimp', category: 'Seafood', price: 14.99, quantity: 20 },
    { id: 17, name: 'Lettuce', category: 'Vegetables', price: 2.49, quantity: 45 },
    { id: 18, name: 'Cucumbers', category: 'Vegetables', price: 1.99, quantity: 50 },
    { id: 19, name: 'Potatoes', category: 'Vegetables', price: 3.99, quantity: 80 },
    { id: 20, name: 'Onions', category: 'Vegetables', price: 2.49, quantity: 60 },
    { id: 21, name: 'Beef', category: 'Meat', price: 10.99, quantity: 25 },
    { id: 22, name: 'Pork', category: 'Meat', price: 9.99, quantity: 30 },
    { id: 23, name: 'Turkey', category: 'Meat', price: 7.99, quantity: 20 },
    { id: 24, name: 'Quinoa', category: 'Grains', price: 6.99, quantity: 35 },
    { id: 25, name: 'Oats', category: 'Grains', price: 4.99, quantity: 50 },
  ]);

  filteredProducts = signal<GroceryProduct[]>([...this.products()]);
  searchTerm = signal<string>('');

  // Pagination
  pageSize = signal<string>(10);
  pageIndex = signal<number>(0);
  pageSizeOptions = [5, 10, 25, 50];

  // Computed signal for paginated data
  paginatedProducts = computed(()com => {
    const filtered = this.filteredProducts();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm.set(filterValue);

    if (!filterValue) {
      this.filteredProducts.set([...this.products()]);
    } else {
      const filtered = this.products().filter(product =>
        product.name.toLowerCase().includes(filterValue)
      );
      this.filteredProducts.set(filtered);
    }

    // Reset to first page when filtering
    this.pageIndex.set(0);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  editProduct(product: GroceryProduct) {
    console.log('Edit product:', product);
    // TODO: Implement edit functionality
  }

  deleteProduct(product: GroceryProduct) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: { productName: product.name }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updatedProducts = this.products().filter(p => p.id !== product.id);
        this.products.set(updatedProducts);

        // Also update filtered products
        const updatedFiltered = this.filteredProducts().filter(p => p.id !== product.id);
        this.filteredProducts.set(updatedFiltered);

        // Adjust page index if needed
        const maxPage = Math.ceil(updatedFiltered.length / this.pageSize()) - 1;
        if (this.pageIndex() > maxPage && maxPage >= 0) {
          this.pageIndex.set(maxPage);
        }
      }
    });
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(AddProductDialog, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProduct(result);
      }
    });
  }

  addProduct(product: Omit<GroceryProduct, 'id'>) {
    const newId = Math.max(...this.products().map(p => p.id), 0) + 1;
    const newProduct: GroceryProduct = {
      id: newId,
      ...product
    };

    // Add new product at the beginning of the list
    const updatedProducts = [newProduct, ...this.products()];
    this.products.set(updatedProducts);

    // Update filtered products if no search is active
    if (!this.searchTerm()) {
      this.filteredProducts.set(updatedProducts);
    }

    // Reset to first page to show the newly added product
    this.pageIndex.set(0);
  }
}

// Add Product Dialog Component
@Component({
  selector: 'add-product-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <mat-icon class="title-icon">shopping_cart</mat-icon>
        <h2 mat-dialog-title>Add New Product</h2>
      </div>
    </div>
    <mat-dialog-content>
      <form class="product-form">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input class="form-input" [(ngModel)]="product.name" name="name" required />
        </div>

        <div class="form-group">
          <label class="form-label">Category *</label>
          <input class="form-input" [(ngModel)]="product.category" name="category" required />
        </div>

        <div class="form-row">
          <div class="form-group half-width">
            <label class="form-label">Price ($) *</label>
            <input class="form-input" type="number" [(ngModel)]="product.price" name="price" step="0.01" min="0" required />
          </div>

          <div class="form-group half-width">
            <label class="form-label">Quantity *</label>
            <input class="form-input" type="number" [(ngModel)]="product.quantity" name="quantity" min="0" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Image URL (Optional)</label>
          <input class="form-input" [(ngModel)]="product.imageUrl" name="imageUrl" />
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button mat-dialog-close class="cancel-btn">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button
        mat-raised-button
        color="primary"
        [mat-dialog-close]="product"
        [disabled]="!isFormValid()"
        class="add-btn"
      >
        <mat-icon>add</mat-icon>
        Add Product
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      background: linear-gradient(135deg, #6F9F9C 0%, #577E89 100%);
      margin: -24px -24px 0 -24px;
      padding: 20px 32px;
      border-radius: 12px 12px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    h2 {
      color: white !important;
      margin: 0 !important;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .product-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 32px 0 24px 0;
      min-width: 550px;
      max-width: 550px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      color: #577E89;
      font-size: 13px;
      font-weight: 600;
      margin: 0;
      padding-left: 4px;
      letter-spacing: 0.3px;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      font-size: 16px;
      color: #2f1f1a;
      border: 2px solid #DEC4B4;
      border-radius: 8px;
      background-color: #ffffff;
      transition: all 0.3s ease;
      font-family: Roboto, "Helvetica Neue", sans-serif;
      box-sizing: border-box;
      -moz-appearance: textfield;
    }

    .form-input::-webkit-outer-spin-button,
    .form-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .form-input:focus {
      outline: none;
      border-color: #6F9F9C;
      box-shadow: 0 0 0 3px rgba(111, 159, 156, 0.1);
    }

    .form-input:hover:not(:focus) {
      border-color: #577E89;
    }

    .form-row {
      display: flex;
      gap: 20px;
    }

    .half-width {
      flex: 1;
    }



    .dialog-actions {
      padding: 24px 0 0 0;
      gap: 16px;
      border-top: 2px solid #E2D8A5;
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .cancel-btn {
      color: #577E89 !important;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px !important;
      border: 2px solid #DEC4B4 !important;
      border-radius: 8px !important;
      transition: all 0.3s ease;
      min-width: 120px;
      height: 44px;
    }

    .cancel-btn:hover {
      background-color: rgba(87, 126, 137, 0.08) !important;
      border-color: #577E89 !important;
      transform: translateY(-1px);
    }

    .cancel-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .add-btn {
      background-color: #6F9F9C !important;
      color: white !important;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 28px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease;
      min-width: 140px;
      height: 44px;
      box-shadow: 0 2px 8px rgba(111, 159, 156, 0.25);
    }

    .add-btn:hover:not(:disabled) {
      background-color: #5a8a87 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(111, 159, 156, 0.4);
    }

    .add-btn:disabled {
      background-color: #DEC4B4 !important;
      color: #999 !important;
      cursor: not-allowed;
      box-shadow: none;
      opacity: 0.6;
    }

    .add-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class AddProductDialog {
  product = {
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    imageUrl: ''
  };

  isFormValid(): boolean {
    return !!(
      this.product.name.trim() &&
      this.product.category.trim() &&
      this.product.price > 0 &&
      this.product.quantity >= 0
    );
  }
}

// Confirm Delete Dialog Component
@Component({
  selector: 'confirm-delete-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="delete-title">
      <mat-icon class="warning-icon">warning</mat-icon>
      Confirm Delete
    </h2>
    <mat-dialog-content>
      <p class="delete-message">
        Are you sure you want to delete <strong>"{{ data.productName }}"</strong>?
      </p>
      <p class="delete-warning">
        This action cannot be undone.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" class="cancel-btn">
        Cancel
      </button>
      <button
        mat-raised-button
        [mat-dialog-close]="true"
        class="delete-btn"
      >
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .delete-title {
      color: #E1A36F;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
    }

    .warning-icon {
      color: #E1A36F;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .delete-message {
      font-size: 16px;
      color: #2f1f1a;
      margin: 16px 0 8px 0;
      line-height: 1.5;
    }

    .delete-message strong {
      color: #577E89;
      font-weight: 600;
    }

    .delete-warning {
      font-size: 14px;
      color: #E1A36F;
      font-style: italic;
      margin: 8px 0 16px 0;
    }

    mat-dialog-actions {
      padding: 16px 0;
      gap: 12px;
    }

    .cancel-btn {
      color: #577E89;
      font-weight: 500;
    }

    .delete-btn {
      background-color: #E1A36F !important;
      color: white !important;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .delete-btn:hover {
      background-color: #d89560 !important;
    }

    .delete-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class ConfirmDeleteDialog {
  data = inject<{ productName: string }>(MAT_DIALOG_DATA);
}
