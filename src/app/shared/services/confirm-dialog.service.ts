import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {

  dialogRef: MatDialogRef<ConfirmDialogComponent>;
  constructor(
    private dialog: MatDialog
  ) { }

  open(options: any) {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'confirm-dialog',
      maxWidth: '350px',
      data: {
        title: options.title,
        message: options.message,
        cancelText: options.cancelText,
        confirmText: options.confirmText
      }
    });
  }

  confirmed(): Observable<boolean> {
    return this.dialogRef
      .afterClosed()
      .pipe(
        take(1),
        map(res => {
          return res;
        })
      );
  }

}