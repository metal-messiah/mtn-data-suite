import { Injectable } from '@angular/core';
import { BasicEntityListComponent } from '../../interfaces/basic-entity-list-component';
import { ErrorService } from './error.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { AuditingEntity } from '../../models/auditing-entity';
import { finalize } from 'rxjs/internal/operators';

@Injectable()
export class EntityListService<T extends AuditingEntity> {

  constructor(
    private dialog: MatDialog,
    private errorService: ErrorService,
    private snackBar: MatSnackBar
  ) {
  }

  initialize(comp: BasicEntityListComponent<T>) {
    comp.isLoading = true;
    comp.loadEntities();
  }

  confirmDelete(comp: BasicEntityListComponent<T>, entity: T) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete ${comp.getTypeName()}!`,
        question: `Are you sure you wish to delete this ${comp.getTypeName()}?`
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.deleteEntity(comp, entity);
      }
    });
  }

  deleteEntity(comp: BasicEntityListComponent<T>, entity: T) {
    comp.isDeleting = true;
    comp.getEntityService().delete(entity.id)
      .pipe(finalize(() => comp.isDeleting = false))
      .subscribe(
      () => {
        this.snackBar.open(`Successfully deleted ${comp.getTypeName()}!`, null, {duration: 2000});
        this.initialize(comp);
      },
      err => this.errorService.handleServerError(`Failed to delete ${comp.getTypeName()}!`, err,
        () => comp.isDeleting = false,
        () => this.deleteEntity(comp, entity))
    );
  }
}
