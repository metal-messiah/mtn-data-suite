import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'mds-logo-menu',
  templateUrl: './logo-menu.component.html',
  styleUrls: ['./logo-menu.component.css']
})
export class LogoMenuComponent implements OnInit {

  @Input() showHome = true;

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

}
