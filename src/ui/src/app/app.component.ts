/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

export interface DropdownData {
  [key: string]: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading = false;
  loadingProgress: number | undefined;
  dropdownsData: DropdownData = {};
  numberOfImages = 1;
  selectedValues: { [key: string]: string | null } = {};

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize selected values
    for (const key of Object.keys(this.dropdownsData)) {
      this.selectedValues[key] = null;
    }

    this.loadDropDowns();
  }

  onDropdownChange(dropdownName: string, selectedValue: string) {
    this.selectedValues[dropdownName] = selectedValue;
    return true;
  }

  loadDropDowns() {
    this.isLoading = true;
    google.script.run
      .withSuccessHandler((dropdowns: DropdownData) => {
        this.dropdownsData = dropdowns;
        console.log('dropdownsData', this.dropdownsData);
        this.isLoading = false;
        this.cd.detectChanges();
      })
      .loadDropDowns();
  }

  generateSelected() {
    this.isLoading = true;
    google.script.run
      .withSuccessHandler(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
      .processImagesForSelectedDropdowns(
        this.numberOfImages,
        this.selectedValues
      );
  }

  generateAutomatically() {
    this.isLoading = true;
    google.script.run
      .withSuccessHandler(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
      .processImagesForSelectedDropdowns(this.numberOfImages);
  }
}
