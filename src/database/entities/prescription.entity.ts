import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Appointment } from './appointment.entity';

@Entity('prescriptions')
export class Prescription extends BaseEntity {
  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'json' })
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  appointment: Appointment;
}
