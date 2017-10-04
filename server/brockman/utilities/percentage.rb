def percentage(total, portion)

  return 0 if total == 0 or ! total.is_a? Fixnum
  return 0 if portion == 0 or ! portion.is_a? Fixnum

  return ((portion.to_f / total.to_f) * 100).to_i

end
