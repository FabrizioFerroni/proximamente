import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subcriptor } from 'src/app/class/subcriptor';
import { ProximamenteService } from 'src/app/services/proximamente.service';


declare var iziToast: any;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  subscritor: Subcriptor = new Subcriptor();
  btn_load = false;
  data: any;
  email!: string;
  nombre!: string;
  token: string = '';

  constructor(
    private proximamenteService: ProximamenteService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.params.email;
    if (this.email) {
      console.log(this.email);
      $('#dessubscribeModal').modal('show');
      $('.modal-backdrop').addClass('show');
    }
  }

  darse_de_baja() {
    this.btn_load = true;
    this.proximamenteService.post_unsusscribe(this.email).subscribe(
      response => {
        console.log('respuestas', response);
        this.data = response.data;
        if (response.respuesta == true) {
          iziToast.success({
            // title: 'Lo siento :/',
            title: 'Lo siento 😣',
            position: 'topRight',
            // message: 'Te has dado de baja de las subcripciones con éxito.'
            message: response.mensaje
          });
          this.btn_load = false;
        } else {
          iziToast.error({
            title: 'Error',
            position: 'topRight',
            message: response.mensaje
            // message: 'Te has dado de baja de las subcripciones con éxito.'
          });
            this.btn_load = false;
        }
        this.router.navigate(['/'])
        $('#dessubscribeModal').modal('hide');
        $('.modal-backdrop').removeClass('show');

      },
      error => {
        console.log(error);
      }
    )
  }


  guardarSubscriptor() {
    this.btn_load = true;
    this.data = {
      nombre: this.nombre,
      email: this.email
    }
    this.proximamenteService.post_suscribirse(this.data).subscribe(
      response => {
        console.log(response);

        // iziToast.success({
        //   title: response.titulo,
        //   position: 'topRight',
        //   message: response.mensaje
        // });

        iziToast.success({
          title: 'Éxito',
          position: 'topRight',
          message: response.mensaje
        });


        this.btn_load = false;
        this.nombre = '';
        this.email = '';
        $('#subscribeModal').modal('hide');
        $('.modal-backdrop').removeClass('show');
      },
      error => {
        console.log(error);
        iziToast.error({
          title: 'Error',
          position: 'topRight',
          message: error.mensaje
          // message: 'No te pudiste subscribir'
        });
        this.btn_load = false;
      }
    )
  }

  onSubmit(empleadoForm: any) {
    if (empleadoForm.valid) {
      this.guardarSubscriptor();
    } else {
      iziToast.warning({
        title: 'Advertencia',
        position: 'topRight',
        message: 'Los campos no pueden estar vacios'
      });
    }

  }

  reset():void{
    this.nombre = '';
    this.email = ''
  }


}
