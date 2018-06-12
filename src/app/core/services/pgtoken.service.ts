import { Injectable } from "@angular/core";

@Injectable()
export class PGTokenService {
  dummyData: object;

  constructor() {
    this.dummyData = {
      access_token:
        "8m4e0dgb3X1q3AIQRh9Tmuue60kUEMDSp-oValYozXx0mWJUVGcyntwHmnqu8aEQSlCvJMeS816te95wUH6kb6oIBlPx1ZmQKdaohW07vhYRpoYyZf60CH0WLHpEpHJMskjEpnn5cQUGXvSGdQDJGw..",
      expires_in: 1209600
    };
  }

  getToken() {
    return this.dummyData;
  }
}
