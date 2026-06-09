import { Entity, Column, OneToOne, JoinColumn, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('doctors')
export class Doctor extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  specialization: string;

  @Column({ type: 'int' })
  experience: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  consultationFee: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @OneToOne(() => User, (user) => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne('Department', 'doctors', {
    nullable: true,
  })
  @JoinColumn()
  department: any;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
}
