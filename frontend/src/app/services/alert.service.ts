import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  /**
   * Exibe um alerta de sucesso
   */
  success(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#27ae60', // success-color
      confirmButtonText: 'OK',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um alerta de erro
   */
  error(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#e74c3c', // danger-color
      confirmButtonText: 'OK',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um alerta de aviso
   */
  warning(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#f39c12', // warning-color
      confirmButtonText: 'OK',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um alerta informativo
   */
  info(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#3498db', // info-color
      confirmButtonText: 'OK',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um popup de confirmação
   */
  confirm(
    title: string,
    text?: string,
    confirmText: string = 'Sim',
    cancelText: string = 'Cancelar',
    icon: 'warning' | 'question' | 'info' = 'question'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#2c3e50', // primary-color
      cancelButtonColor: '#6c757d',
      reverseButtons: true, // Coloca o botão de confirmação à direita
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um popup de confirmação para ações destrutivas (ex: deletar)
   */
  confirmDanger(
    title: string,
    text?: string,
    confirmText: string = 'Sim, excluir',
    cancelText: string = 'Cancelar'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#e74c3c', // danger-color
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }

  /**
   * Exibe um alerta simples (substitui alert())
   */
  alert(title: string, text?: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'OK',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        popup: 'swal2-popup-custom'
      },
      allowOutsideClick: false,
      allowEscapeKey: true
    } as SweetAlertOptions);
  }
}

