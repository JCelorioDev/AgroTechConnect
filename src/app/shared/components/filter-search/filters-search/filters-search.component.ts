import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'shared-filters-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    TooltipModule
  ],
  templateUrl: './filters-search.component.html',
  styleUrl: './filters-search.component.scss'
})
export class FiltersSearchComponent {
  @Output() filterChange = new EventEmitter<{ year: number | null, month: number | null }>();
  
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  showYearDropdown = false;
  showMonthDropdown = false;
  
  yearOptions = [
    { label: '2024', value: 2024 },
    { label: '2023', value: 2023 },
    { label: '2022', value: 2022 }
  ];
  
  monthOptions = [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ];

  get hasActiveFilters(): boolean {
    return this.selectedYear !== null || this.selectedMonth !== null;
  }

  get selectedMonthLabel(): string {
    if (!this.selectedMonth) return 'Mes';
    const month = this.monthOptions.find(m => m.value === this.selectedMonth);
    return month ? month.label : 'Mes';
  }

  onYearSelect() {
    this.showYearDropdown = false;
    this.onFilterChange();
  }

  onMonthSelect() {
    this.showMonthDropdown = false;
    this.onFilterChange();
  }

  closeAllDropdowns() {
    this.showYearDropdown = false;
    this.showMonthDropdown = false;
  }

  onFilterChange() {
    this.filterChange.emit({
      year: this.selectedYear,
      month: this.selectedMonth
    });
  }

  clearFilters() {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.onFilterChange();
  }
}