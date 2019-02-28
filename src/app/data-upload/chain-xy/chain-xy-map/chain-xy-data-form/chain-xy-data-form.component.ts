// UTILITIES
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

// SERVICES
import { SourceUpdatableService } from 'app/core/services/source-updatable.service';
import { ErrorService } from '../../../../core/services/error.service';

// MODELS
import { SourceUpdatable } from '../../../../models/source-updatable';
import { StoreSource } from '../../../../models/full/store-source';
import { ChainXy } from 'app/models/chain-xy';

// COMPONENTS
import { QuadDialogComponent } from '../../../../casing/quad-dialog/quad-dialog.component';

@Component({
	selector: 'mds-chain-xy-data-form',
	templateUrl: './chain-xy-data-form.component.html',
	styleUrls: [ './chain-xy-data-form.component.css' ]
})
export class ChainXyDataFormComponent implements OnChanges {
	@Input() chainXyUpdatable: SourceUpdatable;
	@Input() chainXyFeature: ChainXy;
	@Input() storeSource: StoreSource;

	@Output() cancelEvent = new EventEmitter<void>();
	@Output() completedEvent = new EventEmitter<void>();

	saving = false;

	form: FormGroup;

	constructor(
		private sourceUpdatableService: SourceUpdatableService,
		private errorService: ErrorService,
		private fb: FormBuilder,
		private dialog: MatDialog,
		private snackBar: MatSnackBar
	) {
		this.createForm();
	}

	ngOnChanges() {
		if (!(this.chainXyFeature && this.chainXyUpdatable && this.storeSource)) {
			this.cancelEvent.emit();
		} else {
			if (!this.chainXyUpdatable.siteId) {
				this.chainXyUpdatable.latitude = this.chainXyFeature.Latitude;
				this.chainXyUpdatable.longitude = this.chainXyFeature.Longitude;
			}

			this.resetForm();
		}
	}

	private createForm() {
		this.form = this.fb.group({
			shoppingCenterId: null,
			shoppingCenterName: '',
			siteId: null,
			address: '',
			city: '',
			county: '',
			state: '',
			postalCode: '',
			quad: '',
			intersectionStreetPrimary: '',
			intersectionStreetSecondary: '',
			storeId: null,
			storeName: '',
			dateOpened: '',
			storeSurveyId: null,
			areaTotal: ''
			// storeStatuses: []
		});
	}

	private resetForm() {
		this.form.reset(this.chainXyUpdatable);
		if (!this.chainXyUpdatable.siteId) {
			this.form.get('address').setValue(this.chainXyFeature.Address);
			this.form.get('city').setValue(this.chainXyFeature.City);
			this.form.get('state').setValue(this.chainXyFeature.State);
			this.form.get('postalCode').setValue(this.chainXyFeature.PostalCode);
		}
		if (!this.chainXyUpdatable.storeId) {
			this.form.get('storeName').setValue(this.chainXyFeature.StoreName);
			if (this.chainXyFeature.FirstAppeared) {
				this.form.get('dateOpened').setValue(new Date(this.chainXyFeature.FirstAppeared));
			}
		}
	}

	private prepareSubmission(): SourceUpdatable {
		const submission = new SourceUpdatable(this.form.value);
		if (submission.state != null) {
			submission.state = submission.state.toUpperCase();
		}
		submission.latitude = this.chainXyUpdatable.latitude;
		submission.longitude = this.chainXyUpdatable.longitude;

		submission.storeSource = this.storeSource;
		return submission;
	}

	submit() {
		const submission = this.prepareSubmission();

		this.saving = true;
		this.sourceUpdatableService.submitUpdate(submission).pipe(finalize(() => (this.saving = false))).subscribe(
			(result) => {
				this.snackBar
					.open(`Successfully updated record`, 'View', { duration: 4000 })
					.onAction()
					.subscribe(() => {
						window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
					});

				this.completedEvent.emit();
			},
			(err) =>
				this.errorService.handleServerError(`Failed to update from ChainXY record!`, err, () =>
					console.log(err)
				)
		);
	}

	showQuadDialog() {
		const dialogRef = this.dialog.open(QuadDialogComponent);

		dialogRef.afterClosed().subscribe((quad) => {
			if (typeof quad === 'string' && quad !== '') {
				const ctrl = this.form.get('quad');
				ctrl.setValue(quad);
				ctrl.markAsDirty();
			}
		});
	}
}
