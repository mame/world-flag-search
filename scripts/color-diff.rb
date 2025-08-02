# Li, et al. Comprehensive color solutions: CAM16, CAT16, and CAM16-UCS

class RGB_to_CAM16UCS
  def initialize(l_a, y_b, f, c, n_c, xyz_w)
    @c = c
    @N_c = n_c
    @Y_w = xyz_w[1]

    rgb_w = m16(xyz_w)
    d = f * (1 - (1 / 3.6) * Math.exp((-l_a - 42) / 92.0))
    k4 = (1 / (5 * l_a + 1)) ** 4
    @F_L = 0.2 * k4 * (5 * l_a) + 0.1 * (1 - k4) ** 2 * (5 * l_a) ** (1.0 / 3)
    @n = y_b / @Y_w
    @z = 1.48 + Math.sqrt(@n)
    @N_bb = 0.725 * (1 / @n) ** 0.2
    @D_rgb = rgb_w.map {|v| d * @Y_w / v + 1 - d }
    r_aw, g_aw, b_aw = postadaptation_cone_response(rgb_w.zip(@D_rgb).map {|v, d| d * v })
    @A_w = (2 * r_aw + g_aw + b_aw / 20 - 0.305) * @N_bb
  end

  def self.srgb_to_xyz(srgb)
    r_lin, g_lin, b_lin = srgb.map do |n|
      v = n / 255.0
      v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    end
    [
      (0.4124 * r_lin + 0.3576 * g_lin + 0.1805 * b_lin) * 100,
      (0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin) * 100,
      (0.0193 * r_lin + 0.1192 * g_lin + 0.9505 * b_lin) * 100,
    ]
  end


  def m16((x, y, z))
    [
       0.401288 * x + 0.650173 * y - 0.051461 * z,
      -0.250268 * x + 1.204414 * y + 0.045854 * z,
      -0.002079 * x + 0.048952 * y + 0.953127 * z,
    ]
  end

  def postadaptation_cone_response(rgb)
    rgb.map do |v|
      sign = v < 0 ? -1 : 1
      x = (sign * @F_L * v / 100) ** 0.42
      sign * 400 * (x / (x + 27.13)) + 0.1
    end
  end

  TABLE_A2 = [
    { h:  20.14, e: 0.8, hq:   0.0 }, # red
    { h:  90.00, e: 0.7, hq: 100.0 }, # yellow
    { h: 164.25, e: 1.0, hq: 200.0 }, # green
    { h: 237.53, e: 1.2, hq: 300.0 }, # blue
    { h: 380.14, e: 0.8, hq: 400.0 }, # red
  ]

  def xyz_to_cam16ucs(xyz)
    # Step 1
    rgb = m16(xyz)

    # Step 2
    rgb_c = rgb.zip(@D_rgb).map {|v, d| d * v }

    # Step 3
    r_a, g_a, b_a = postadaptation_cone_response(rgb_c)

    # Step 4
    a = r_a - 12 * g_a / 11 + b_a / 11
    b = (r_a + g_a - 2 * b_a) / 9
    h = Math.atan2(b, a) * 180 / Math::PI

    h_ = h < TABLE_A2[0][:h] ? h + 360 : h
    e_t = (Math.cos(h_ * Math::PI / 180 + 2) + 3.8) / 4
    i = (0..3).find {|i| h_ < TABLE_A2[i + 1][:h] }
    x_i = (h_ - TABLE_A2[i][:h]) / TABLE_A2[i][:e]
    x_i1 = (TABLE_A2[i + 1][:h] - h) / TABLE_A2[i + 1][:e]
    hq = TABLE_A2[i][:hq] + 100 * x_i / (x_i + x_i1)

    ar = (2 * r_a + g_a + b_a / 20 - 0.305) * @N_bb

    j = 100 * (ar / @A_w) ** (@c * @z)

    t = (50000 / 13.0 * @N_c * @N_bb * e_t * Math.hypot(a, b)) / (r_a + g_a + 21 * b_a / 20)
    c = t ** 0.9 * Math.sqrt(j / 100) * (1.64 - 0.29 ** @n) ** 0.73
    m = c * @F_L ** 0.25


    j_ = 1.7 * j / (1 + 0.007 * j)
    m_ = Math.log(1 + 0.0228 * m) / 0.0228
    a_ = m_ * Math.cos(h * Math::PI / 180)
    b_ = m_ * Math.sin(h * Math::PI / 180)

    [j_, a_, b_]
  end

  Default = self.new(
    64 / Math::PI * 0.2,       # Luminance of test adapting field (cd/m^2)
    20,                        # Background in test conditions
    1.0, 0.69, 1.0,            # Surround parameters: Average
    [95.047, 100.000, 108.883] # Adopted white in test illuminant: D65
  )
end

def rgb_to_cam16ucs(rgb)
  RGB_to_CAM16UCS::Default.xyz_to_cam16ucs(RGB_to_CAM16UCS.srgb_to_xyz(rgb))
end

def color_diff(rgb1, rgb2)
  j1, a1, b1 = rgb_to_cam16ucs(rgb1)
  j2, a2, b2 = rgb_to_cam16ucs(rgb2)
  d = (j1 - j2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2
  Math.sqrt(d)
end
