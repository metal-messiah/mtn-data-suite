import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'mds-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

}
