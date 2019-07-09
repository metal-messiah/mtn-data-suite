import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-seasonality',
  templateUrl: './seasonality.component.html',
  styleUrls: ['./seasonality.component.css']
})
export class SeasonalityComponent implements OnInit {

  readonly months = [
    {placeholder: 'January', formControlName: 'seasonalityJan'},
    {placeholder: 'February', formControlName: 'seasonalityFeb'},
    {placeholder: 'March', formControlName: 'seasonalityMar'},
    {placeholder: 'April', formControlName: 'seasonalityApr'},
    {placeholder: 'May', formControlName: 'seasonalityMay'},
    {placeholder: 'June', formControlName: 'seasonalityJun'},
    {placeholder: 'July', formControlName: 'seasonalityJul'},
    {placeholder: 'August', formControlName: 'seasonalityAug'},
    {placeholder: 'September', formControlName: 'seasonalitySep'},
    {placeholder: 'October', formControlName: 'seasonalityOct'},
    {placeholder: 'November', formControlName: 'seasonalityNov'},
    {placeholder: 'December', formControlName: 'seasonalityDec'}
  ];

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }

  getVolume() {
    const totalVolumeControl = this.service.storeVolumeForm.get('volumeTotal');
    if (totalVolumeControl && totalVolumeControl.value) {
      return '$' + totalVolumeControl.value.toLocaleString();
    } else {
      return 'Not yet entered';
    }
  }

  getCalculatedSeasonality(month) {
    const totalVolumeControl = this.service.storeVolumeForm.get('volumeTotal');
    if (totalVolumeControl) {
      const totalVolume = totalVolumeControl.value;
      if (totalVolume) {
        const seasonality = this.service.storeSurveyForm.get(month.formControlName).value;
        if (seasonality) {
          const seasonalVolume = (seasonality / 100 * totalVolume) + totalVolume;
          return '$' + seasonalVolume.toLocaleString();
        }
      }
    }
    return null;
  }

}
